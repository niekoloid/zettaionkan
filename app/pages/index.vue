<script setup lang="ts">
useHead({
  title: 'いろおと - 絶対音感トレーニング'
})
import * as Tone from 'tone'




import { type Chord } from '~/constants/chords'

interface DisplayChord extends Chord {
  globalIndex: number
  isLight: boolean
}

const currentChord = ref<DisplayChord | null>(null)
const pressedNotes = ref<Set<string>>(new Set())
const isChordPlaying = ref(false)
const playbackTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// === Single List Logic ===
// Flatten all 14 basic chords into a single list with metadata
const { allChords: customChords } = useChordSettings()
const { namingConvention, updateNamingConvention, instrument, updateInstrument, formatColorName, formatChordName, colorFormat, updateColorFormat, isKeyboardSoundEnabled, updateKeyboardSound } = useAppSettings()
const { user, userTier, authReady } = useAuth()
const { isPro, hasAccess } = usePro()

const allChords = computed(() => {
  const selected = customChords.value.filter(c => c.homeEnabled)
  // If nothing is selected, display everything. If something is selected, display only those.
  const displaySource = selected.length > 0 ? selected : customChords.value

  return displaySource.map((chord, index) => {
    const r = parseInt(chord.color.slice(1, 3), 16)
    const g = parseInt(chord.color.slice(3, 5), 16)
    const b = parseInt(chord.color.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const isLight = brightness > 180
    
    // Use granular feature gates for each chord in Home context
    const isLocked = !hasAccess(`home_chord_${chord.id}` as any, userTier.value)

    return {
      ...chord,
      globalIndex: index + 1,
      isLight,
      isLocked
    }
  })
})

const toSharp = (n: string) => {
  const map = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }
  const clean = n.replace('♭', 'b')
  for (const [flat, sharp] of Object.entries(map)) {
    if (clean.startsWith(flat)) return clean.replace(flat, sharp)
  }
  return clean
}

const activeNotesSet = computed(() => {
  if (!currentChord.value) return new Set<string>()
  return new Set(currentChord.value.notes.map(toSharp))
})

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler
} = useAudio()

const { getPreferredInstrument } = useAudioSettings()

onMounted(async () => {
  // Wait for auth state to be confirmed to avoid loading wrong instrument initially
  await authReady
  
  // Initial load
  let preferred = getPreferredInstrument(userTier.value)
  
  // Safeguard: If steinway is preferred but user is not PRO, force yamaha
  if (preferred === 'steinway' && !isPro(userTier.value)) {
    preferred = 'yamaha'
  }
  
  loadSampler(preferred as 'yamaha' | 'steinway')
  
  // Set initial chord
  if (allChords.value.length > 0) {
    currentChord.value = allChords.value[0]!
  }
})

onUnmounted(() => {
  if (playbackTimeout.value) {
    clearTimeout(playbackTimeout.value)
  }
})



const isMenuOpen = ref(true)

const playChord = async (notes: string[]) => {
  if (Tone.context.state !== 'running') await Tone.start()
  
  const currentSampler = samplers[selectedInstrument.value]

  if (currentSampler && isSamplerLoaded.value) {
    if (playbackTimeout.value) {
      clearTimeout(playbackTimeout.value)
      playbackTimeout.value = null
    }

    currentSampler.releaseAll()
    pressedNotes.value.clear()
    
    // Set state immediately for UI responsiveness
    isChordPlaying.value = true

    // Audio trigger - Increased to 15s for extra long sustain
    currentSampler.triggerAttackRelease(notes, 15)
    notes.forEach(note => pressedNotes.value.add(note))
    
    playbackTimeout.value = setTimeout(() => {
      notes.forEach(note => pressedNotes.value.delete(note))
      isChordPlaying.value = false
      playbackTimeout.value = null
    }, 15000)
  } else {
    console.warn('Sampler not ready or missing:', selectedInstrument.value)
  }
}

const playNote = async (note: string) => {
  if (!isKeyboardSoundEnabled.value) return
  if (Tone.context.state !== 'running') await Tone.start()
  
  const currentSampler = samplers[selectedInstrument.value]

  if (currentSampler && isSamplerLoaded.value) {
    currentSampler.triggerAttackRelease(note, 10)
    pressedNotes.value.add(note)
    setTimeout(() => pressedNotes.value.delete(note), 10000)
  } else {
    console.warn('Sampler not ready or missing:', selectedInstrument.value)
  }
}

  const toggleChord = async (chord: DisplayChord) => {
    // Check lock
    if ((chord as any).isLocked) {
      const { openProModal } = useProModal()
      if (userTier.value === 'free') {
        openProModal('PROプラン限定', 'この和音（黒鍵など）はPROプランで利用可能です。体験版では制限されています。')
      } else {
        openProModal('PROプラン機能', 'この機能はPROプラン限定です。')
      }
      return
    }

    // 視覚情報（楽譜、鍵盤の着色）は常に更新
    currentChord.value = chord

    // 全ての和音を制限なしで再生
    playChord(chord.notes)
  }

// Piano Keyboard Logic
const whiteKeys = ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']
const keyboardLayout = [
  { note: 'F3', type: 'white' }, { note: 'F#3', type: 'black' },
  { note: 'G3', type: 'white' }, { note: 'G#3', type: 'black' },
  { note: 'A3', type: 'white' }, { note: 'A#3', type: 'black' },
  { note: 'B3', type: 'white' },
  { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' },
  { note: 'D4', type: 'white' }, { note: 'D#4', type: 'black' },
  { note: 'E4', type: 'white' },
  { note: 'F4', type: 'white' }, { note: 'F#4', type: 'black' },
  { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' },
  { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' },
  { note: 'B4', type: 'white' },
  { note: 'C5', type: 'white' }, { note: 'C#5', type: 'black' },
  { note: 'D5', type: 'white' }, { note: 'D#5', type: 'black' },
  { note: 'E5', type: 'white' },
  { note: 'F5', type: 'white' }, { note: 'F#5', type: 'black' },
  { note: 'G5', type: 'white' }
]

const isNoteActive = (note: string) => {
  if (!currentChord.value) return false
  return activeNotesSet.value.has(toSharp(note))
}

const hasBlackKey = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  return !['B', 'E'].includes(noteName)
}

const getBlackKeyNote = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  const octave = whiteNote.match(/\d/)![0]
  return `${noteName}#${octave}`
}

// === Dynamic Layout Logic ===
const gridClasses = computed(() => {
  const count = allChords.value.length
  if (count === 0) return 'hidden'
  if (count === 1) return 'grid-cols-1 max-w-xs mx-auto'
  if (count === 2) return 'grid-cols-2 max-w-md mx-auto'
  if (count === 3) return 'grid-cols-3'
  return 'grid-cols-4'
})

// Desktop tile height. Mobile tiles stay square (aspect-square) so the
// circles never get stretched into pills.
const itemClasses = computed(() => {
  const count = allChords.value.length

  // Menu closed: make tiles bigger for kids
  if (!isMenuOpen.value) {
    if (count <= 2) return 'md:h-64'
    if (count <= 4) return 'md:h-48'
    if (count <= 9) return 'md:h-32'
    return 'md:h-24'
  }

  return count > 0 && count <= 4 ? 'md:h-32' : 'md:h-20'
})

// === Menu ===
const menuItems = [
  {
    to: '/autoplay',
    title: '和音の聞き流し',
    desc: '自動で和音が出題され続けます',
    primary: true,
    icon: ['M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z']
  },
  {
    to: '/chordquizz',
    title: '和音テストに挑戦',
    desc: '和音を色で認識できるかテスト',
    iconBox: 'bg-amber-50 text-amber-600',
    icon: ['M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z']
  },
  {
    to: '/history',
    title: '学習履歴を確認',
    desc: 'これまでのトレーニング成果を見返します',
    iconBox: 'bg-indigo-50 text-indigo-500',
    icon: [
      'M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z',
      'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm2.25 0c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5-7.5 3.358-7.5 7.5Z'
    ]
  },
  {
    to: '/settings',
    title: '各種設定',
    desc: '音源の切り替えやアプリの設定',
    iconBox: 'bg-gray-100 text-gray-500',
    icon: ['M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.349l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.282-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.431l.84-.692a1.875 1.875 0 00.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z']
  }
]

const footerGroups = [
  {
    heading: 'Training',
    links: [
      { to: '/method', label: 'トレーニング方法' },
      { to: '/about', label: 'サービス概要' }
    ]
  },
  {
    heading: 'Support',
    links: [
      { to: '/subscription', label: '料金プラン' },
      { to: '/contact', label: 'お問い合わせ' },
      { to: '/faq', label: 'よくあるご質問 (Q&A)' }
    ]
  }
]

const legalLinks = [
  { to: '/company', label: '運営会社' },
  { to: '/terms', label: '利用規約' },
  { to: '/privacy', label: 'プライバシーポリシー' },
  { to: '/legal', label: '特定商取引法に基づく表記' }
]
</script>

<template>
  <div 
    class="min-h-screen font-['Noto_Sans_JP'] antialiased relative overflow-hidden"
  >
    <!-- Background Layer (Optimized with Opacity) -->
    <div 
      class="fixed inset-0 bg-white pointer-events-none"
    ></div>
    <div 
      class="fixed inset-0 pointer-events-none transition-opacity duration-700"
      :class="isChordPlaying && currentChord ? 'opacity-100' : 'opacity-0'"
      :style="{ 
        backgroundColor: currentChord?.color || 'transparent'
      }"
    ></div>

    <div 
      class="min-h-screen flex flex-col max-w-3xl mx-auto relative z-10"
    >

    <!-- Header -->
    <AppHeader transparent />

    <!-- Main Content -->
    <main class="flex-grow px-4 pb-8 overflow-y-auto" style="scrollbar-gutter: stable;">


      <!-- Score Visualization (Abstracted Component) -->
      <section class="flex flex-col items-center mb-2 text-center">
        <ScoreDisplay :abc="currentChord?.abc" :is-answered="true">
          <template #footer v-if="currentChord">
            <div class="mt-4 text-[14px] font-bold text-gray-700 flex flex-col items-center">
              <span class="whitespace-nowrap">{{ formatChordName(currentChord) }} ({{ formatColorName(currentChord.colorName) }})</span>
            </div>
          </template>
        </ScoreDisplay>
      </section>

      <!-- Keyboard Visualization -->
      <section class="flex flex-col items-center mb-5" aria-label="鍵盤">
        <div class="w-full -mx-4 px-0">
          <div class="relative flex justify-center h-28 bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 overflow-hidden">
            <!-- White Keys -->
            <div 
              v-for="note in whiteKeys" 
              :key="note"
              @click="playNote(note)"
              class="relative flex-grow border-x-[0.5px] border-gray-200 first:border-l-0 last:border-r-0 rounded-b-sm cursor-pointer active:opacity-90 overflow-hidden transition-colors duration-150"
              :class="[
                pressedNotes.has(note) ? 'translate-y-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-[0.98] z-10' : ''
              ]"
              :style="isNoteActive(note) ? { backgroundColor: currentChord?.color } : { backgroundColor: '#fff' }"
            >
              <!-- Only label the C keys; labelling every key at 5-6px was unreadable -->
              <span 
                v-if="note.startsWith('C')"
                class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold"
                :class="[isNoteActive(note) ? (currentChord?.isLight ? 'text-black/50' : 'text-white/80') : (note === 'C4' ? 'text-indigo-400' : 'text-gray-400')]"
              >
                {{ note }}
              </span>
            </div>
            
            <!-- Black Keys -->
            <div class="absolute inset-x-1 top-1 h-16 pointer-events-none flex">
              <div v-for="(note, index) in keyboardLayout" :key="'gap-'+index" 
                class="flex-grow relative h-full"
                :class="{'hidden': note.type === 'black'}"
              >
                <div 
                  v-if="hasBlackKey(note.note)"
                  @click.stop="playNote(getBlackKeyNote(note.note))"
                  class="absolute right-0 translate-x-1/2 w-3/5 h-full rounded-b-sm border-x border-b border-gray-800 z-20 cursor-pointer pointer-events-auto transition-colors duration-150"
                  :class="[
                    isNoteActive(getBlackKeyNote(note.note)) ? '' : 'bg-gray-800',
                    pressedNotes.has(getBlackKeyNote(note.note)) ? 'translate-y-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] brightness-75 scale-95 z-30' : ''
                  ]"
                  :style="isNoteActive(getBlackKeyNote(note.note)) ? { backgroundColor: currentChord?.color } : {}"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Chord List (All Levels) -->
      <section class="mb-8" aria-label="和音">
          <!-- Hint: tells first-time users what to do, and why nothing plays while loading -->
          <p class="text-center text-sm font-bold text-gray-500 mb-4" role="status">
            {{ isLoading ? '音源を読み込み中です…' : 'いろをタップして、和音を聴いてみよう' }}
          </p>
          <div class="grid gap-3 sm:gap-4 transition-all duration-500" :class="gridClasses">
            <button
              v-for="chord in allChords"
              :key="chord.id"
              type="button"
              @click="toggleChord(chord)"
              :aria-label="`${chord.globalIndex}番 ${formatChordName(chord)} ${formatColorName(chord.colorName)}${chord.isLocked ? ' (PROプラン限定)' : ''}`"
              :aria-pressed="currentChord?.id === chord.id"
              class="relative cursor-pointer shadow-sm aspect-square rounded-full md:aspect-auto md:rounded-2xl overflow-hidden transition-all duration-300 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              :class="[
                 currentChord?.id === chord.id 
                    ? 'ring-4 ring-offset-2 ring-gray-300 z-10 scale-105 shadow-md' 
                    : 'hover:scale-105 active:scale-95 hover:shadow-md',
                 itemClasses
              ]"
              :style="{ backgroundColor: chord.color }"
            >
              <!-- Lock: dim the tile and put a small badge in the corner so the number/name stay readable -->
              <div v-if="chord.isLocked" class="absolute inset-0 bg-gray-900/40 z-20">
                <span class="absolute top-1.5 left-1/2 -translate-x-1/2 md:top-2 md:right-2 md:left-auto md:translate-x-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/95 shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>

              <!-- Mobile Content: number + chord name -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center md:hidden"
                :style="{ color: chord.isLight ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.95)' }"
              >
                <span class="text-xl font-black leading-none">{{ chord.globalIndex }}</span>
                <span class="mt-1 text-[10px] font-bold leading-none">{{ formatChordName(chord) }}</span>
              </div>

              <!-- Desktop Content: Detail View -->
              <div class="hidden md:flex items-center w-full h-full px-4">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 text-base font-black shadow-sm border-2 border-white/20"
                  :style="{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: chord.isLight ? '#1f2937' : 'white'
                  }"
                >
                  {{ chord.globalIndex }}
                </div>
                
                <div class="flex flex-col text-left overflow-hidden justify-center h-full">
                  <span 
                    class="font-black text-[15px] leading-tight"
                    :class="chord.isLight ? 'text-gray-900' : 'text-white'"
                  >
                    {{ formatChordName(chord) }}
                  </span>
                  <span 
                    class="text-xs font-bold leading-none mt-1"
                    :class="chord.isLight ? 'text-gray-700' : 'text-white/90'"
                  >
                    {{ formatColorName(chord.colorName) }}
                  </span>
                </div>
              </div>
            </button>
          </div>
      </section>

      <!-- Collapsible Menu Section -->
      <section class="mb-6 px-4">
        <button 
          type="button"
          @click="isMenuOpen = !isMenuOpen"
          :aria-expanded="isMenuOpen"
          aria-controls="home-menu"
          class="w-full flex flex-col items-center justify-center py-3 mb-2 text-gray-500 hover:text-gray-700 transition-colors group"
        >
          <div class="h-1.5 w-16 bg-gray-200 rounded-full mb-2 group-hover:bg-gray-300 transition-colors"></div>
          <span class="text-xs font-bold tracking-wider">
            {{ isMenuOpen ? 'メニューを閉じる(和音を大きく表示)' : 'メニューを開く' }}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mt-1 transition-transform duration-300"
            :class="{ 'rotate-180': !isMenuOpen }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition-all duration-300 ease-out overflow-hidden"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[600px]"
          leave-active-class="transition-all duration-300 ease-in overflow-hidden"
          leave-from-class="opacity-100 max-h-[600px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <nav v-show="isMenuOpen" id="home-menu" aria-label="メインメニュー" class="flex flex-col gap-3">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="group relative flex items-center w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
              :class="item.primary
                ? 'h-20 bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                : 'h-16 bg-white border border-gray-100'"
            >
              <div class="flex items-center w-full px-5">
                <div
                  class="flex items-center justify-center rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="item.primary ? 'w-12 h-12 bg-white/20 text-white' : `w-10 h-10 ${item.iconBox}`"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
                    <path v-for="d in item.icon" :key="d" fill-rule="evenodd" clip-rule="evenodd" :d="d" />
                  </svg>
                </div>

                <div class="ml-4 flex flex-col items-start justify-center flex-grow">
                  <h3 class="font-black tracking-wider" :class="item.primary ? 'text-base' : 'text-sm text-gray-900'">{{ item.title }}</h3>
                  <p class="text-xs font-medium mt-0.5" :class="item.primary ? 'text-white/85' : 'text-gray-500'">{{ item.desc }}</p>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-colors duration-300" :class="item.primary ? 'text-white/70' : 'text-gray-300 group-hover:text-gray-500'" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </NuxtLink>
          </nav>
        </Transition>
      </section>

      <!-- Footer: always visible (legal links must not hide with the menu) -->
      <footer class="mt-8 border-t border-gray-100 pt-8 pb-8 px-6">
        <div class="grid grid-cols-2 gap-x-8 gap-y-8 mb-10">
          <div v-for="group in footerGroups" :key="group.heading" class="space-y-3">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{{ group.heading }}</p>
            <div class="flex flex-col space-y-3">
              <NuxtLink
                v-for="link in group.links"
                :key="link.to"
                :to="link.to"
                class="text-sm text-gray-600 hover:text-gray-900 font-bold transition-colors flex items-center"
              >
                <span class="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2.5 shrink-0"></span>
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-6">
          <div class="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
            <NuxtLink
              v-for="link in legalLinks"
              :key="link.to"
              :to="link.to"
              class="text-xs text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap"
            >{{ link.label }}</NuxtLink>
          </div>
          <p class="text-center text-xs text-gray-400 font-medium">&copy; 2026 Akatsuki Inc.</p>
        </div>
      </footer>
    </main>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for loading overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
