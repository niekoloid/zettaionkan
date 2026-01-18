<script setup lang="ts">
useHead({
  title: '各種設定 - 絶対音感トレーニング'
})

const { 
  selectedInstrument, 
  loadSampler,
  preloadAll,
  isPreloading,
  isLoaded
} = useAudio()

const { userTier, authReady } = useAuth()
const { allChords, saveSingleMapping, resetAll: resetGlobal } = useChordSettings()
const { 
  namingConvention, updateNamingConvention, 
  instrument, updateInstrument, 
  formatColorName, formatChordName, 
  colorFormat, updateColorFormat,
  isKeyboardSoundEnabled, updateKeyboardSound
} = useAppSettings()

const NARRATION_PRESETS = [
  '赤', '黄色', '青', '黒', '緑', 'オレンジ', '紫', 'ピンク', '茶色', '黄緑', 'ベージュ', '薄橙', '肌色', '薄紫', '藤色', 'グレー', '灰色', '水色', '空色'
]

// Mapping Draft State
const draftMappings = ref<Record<string, { color: string; colorName: string; homeEnabled: boolean }>>({})
const showSaveSuccess = ref(false)

const initializeDraft = () => {
  const current: Record<string, { color: string; colorName: string; homeEnabled: boolean }> = {}
  allChords.value.forEach(c => {
    current[c.id] = { color: c.color, colorName: c.colorName, homeEnabled: c.homeEnabled }
  })
  draftMappings.value = current
}

const handleInstrumentChange = (inst: string) => {
  if (inst === selectedInstrument.value) return
  
  if (inst === 'steinway' && userTier.value !== 'premium') {
    alert('Steinway B音源はプレミアムプラン限定です。')
    return
  }

  loadSampler(inst as 'yamaha' | 'steinway')
  updateInstrument(inst)
}

onMounted(async () => {
  await authReady
  initializeDraft()
})

const updateDraft = (id: string, updates: any) => {
  draftMappings.value[id] = { ...draftMappings.value[id], ...updates }
}

const isModified = (chord: any) => {
  const draft = draftMappings.value[chord.id]
  if (!draft) return false
  return (
    draft.color !== chord.color || 
    draft.colorName !== chord.colorName || 
    (draft.homeEnabled ?? false) !== (chord.homeEnabled ?? false)
  )
}

const isSavingMap = ref<Record<string, boolean>>({})

const handleSaveChord = async (id: string) => {
  if (isSavingMap.value[id]) return
  
  isSavingMap.value[id] = true
  
  const timeoutId = setTimeout(() => {
    if (isSavingMap.value[id]) {
      isSavingMap.value[id] = false
      alert('保存がタイムアウトしました。ネットワークを確認してください。')
    }
  }, 10000)

  try {
    await saveSingleMapping(id, draftMappings.value[id]!)
    showSaveSuccess.value = true
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 2000)
  } catch (e) {
    console.error('Settings: Save failed', e)
    alert('保存中にエラーが発生しました。')
  } finally {
    clearTimeout(timeoutId)
    isSavingMap.value[id] = false
  }
}

const handleToggleHome = async (chord: any) => {
  const currentDraft = draftMappings.value[chord.id] || { 
    color: chord.color, 
    colorName: chord.colorName, 
    homeEnabled: chord.homeEnabled 
  }
  
  const nextValue = !currentDraft.homeEnabled
  updateDraft(chord.id, { homeEnabled: nextValue })
  
  try {
    // Save with the new toggle value, but keep the current DB values for color/name 
    // to avoid saving unconfirmed draft changes.
    await saveSingleMapping(chord.id, {
      color: chord.color,
      colorName: chord.colorName,
      homeEnabled: nextValue
    })
  } catch (e) {
    console.error('Auto-save toggle failed:', e)
  }
}

const handleReset = () => {
  if (confirm('全ての和音設定を初期状態に戻しますか？')) {
    resetGlobal()
    initializeDraft()
    showSaveSuccess.value = true
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 3000)
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased">
    <div class="min-h-screen flex flex-col max-w-3xl mx-auto relative">
      <AppHeader showBack />

      <main class="flex-grow px-6 py-8">
        <div class="mb-8">
          <h2 class="text-2xl font-black text-gray-900 mb-2">各種設定</h2>
          <p class="text-sm text-gray-400 font-bold">アプリの表示や音源の設定を変更できます</p>
        </div>

        <!-- Instrument Settings -->
        <section class="space-y-6 mb-12">
          <div class="flex items-center space-x-2">
            <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">使用するピアノ音源</h3>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div 
              @click="handleInstrumentChange('yamaha')"
              class="relative p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm bg-white"
              :class="instrument === 'yamaha' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">🎹</div>
                  <div>
                    <h4 class="font-black text-gray-900">Yamaha C5</h4>
                    <p class="text-[10px] font-bold text-gray-400 mt-0.5">落ち着いた、温かみのある伝統的なピアノ音源</p>
                  </div>
                </div>
                <div v-if="instrument === 'yamaha'" class="text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              @click="handleInstrumentChange('steinway')"
              class="relative p-5 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm bg-white"
              :class="[
                instrument === 'steinway' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200',
                userTier !== 'premium' ? 'opacity-80' : ''
              ]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">✨</div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h4 class="font-black text-gray-900">Steinway Model B</h4>
                      <span v-if="userTier !== 'premium'" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full uppercase tracking-tighter">Premium</span>
                    </div>
                    <p class="text-[10px] font-bold text-gray-400 mt-0.5">繊細で豊かな表現力を持つ最高峰の響き</p>
                  </div>
                </div>
                <div v-if="instrument === 'steinway'" class="text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div v-else-if="userTier !== 'premium'" class="text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Keyboard UI Settings -->
        <section class="space-y-6 mb-12">
          <div class="flex items-center space-x-2">
            <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">鍵盤の設定</h3>
          </div>

          <div 
            @click="updateKeyboardSound(!isKeyboardSoundEnabled)"
            class="flex items-center justify-between p-5 bg-white rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]"
            :class="isKeyboardSoundEnabled ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100'"
          >
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">🔊</div>
              <div>
                <h4 class="font-black text-gray-900 text-sm">ホーム画面の鍵盤の音を鳴らす</h4>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">鍵盤を押したときに音を出します</p>
              </div>
            </div>
            <div 
              class="w-10 h-6 rounded-full transition-colors relative shrink-0"
              :class="isKeyboardSoundEnabled ? 'bg-indigo-600' : 'bg-gray-200'"
            >
              <div 
                class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                :class="isKeyboardSoundEnabled ? 'translate-x-4' : ''"
              ></div>
            </div>
          </div>
        </section>

        <!-- Color Name Format Settings -->
        <section class="space-y-6 mb-12">
          <div class="flex items-center space-x-2">
            <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">色の表示形式</h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div 
              @click="updateColorFormat('standard')"
              class="relative p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-2"
              :class="colorFormat === 'standard' ? 'border-indigo-500 ring-4 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200'"
            >
              <span class="text-xl font-black text-gray-900">赤・黄色</span>
              <p class="text-[9px] font-bold text-gray-400">標準（漢字/カタカナ）</p>
              <div v-if="colorFormat === 'standard'" class="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div 
              @click="updateColorFormat('hiragana')"
              class="relative p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-2"
              :class="colorFormat === 'hiragana' ? 'border-indigo-500 ring-4 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200'"
            >
              <span class="text-xl font-black text-gray-900">あか・きいろ</span>
              <p class="text-[9px] font-bold text-gray-400">すべてひらがな</p>
              <div v-if="colorFormat === 'hiragana'" class="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- Naming Convention Settings -->
        <section class="space-y-6 mb-12">
          <div class="flex items-center space-x-2">
            <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">音名の表示形式</h3>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div 
              @click="updateNamingConvention('italian')"
              class="relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24"
              :class="namingConvention === 'italian' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200'"
            >
              <span class="text-sm font-black text-gray-900">ド・ミ・ソ</span>
              <p class="text-[8px] font-bold text-gray-400">標準的</p>
              <div v-if="namingConvention === 'italian'" class="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div 
              @click="updateNamingConvention('hybrid')"
              class="relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24"
              :class="namingConvention === 'hybrid' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200'"
            >
              <span class="text-sm font-black text-gray-900">ラ・チス・ミ</span>
              <p class="text-[8px] font-bold text-gray-400">半音は独語読み</p>
              <div v-if="namingConvention === 'hybrid'" class="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <div 
              @click="updateNamingConvention('german')"
              class="relative p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col items-center justify-center text-center space-y-1 h-24"
              :class="namingConvention === 'german' ? 'border-indigo-500 ring-2 ring-indigo-50 animate-pulse-subtle' : 'border-gray-100 hover:border-gray-200'"
            >
              <span class="text-sm font-black text-gray-900">C - E - G</span>
              <p class="text-[8px] font-bold text-gray-400">コード名</p>
              <div v-if="namingConvention === 'german'" class="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- Chord Color Customization -->
        <section class="space-y-6 mb-12">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">和音と色のカスタマイズ</h3>
            </div>
            <button 
              @click="handleReset"
              class="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              初期設定に戻す
            </button>
          </div>

          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
            <p class="text-[10px] font-bold text-gray-400 leading-normal">
              各和音に対応する色と、音声ガイドでの読み上げ名を変更できます。<br>
              「Home表示」をオンにすると、その和音だけをHome画面に表示できます（未選択時はすべて表示されます）。<br>
              変更後、各項目の「確定して保存」ボタンを押してください。
            </p>

            <div class="space-y-4">
              <div 
                v-for="chord in allChords" 
                :key="chord.id"
                class="bg-white p-4 rounded-3xl border transition-all duration-300 shadow-sm space-y-4 relative overflow-hidden"
                :class="isModified(chord) ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-md' : 'border-gray-100'"
              >
                <div v-if="isModified(chord)" class="absolute top-0 left-0 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-br-xl uppercase tracking-widest animate-pulse">
                  未確定
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {{ formatChordName(chord) }}
                    </span>
                  </div>
                  <button 
                    @click="handleSaveChord(chord.id)"
                    type="button"
                    class="px-4 py-1.5 rounded-full font-bold text-[10px] active:scale-95 transition-all flex items-center space-x-1"
                    :class="[
                      isModified(chord) 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-bounce-subtle' 
                        : 'bg-gray-100 text-gray-400 cursor-default pointer-events-none',
                      isSavingMap[chord.id] ? 'opacity-50 pointer-events-none' : ''
                    ]"
                  >
                    <svg v-if="!isSavingMap[chord.id]" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <div v-else class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{{ isSavingMap[chord.id] ? '保存中...' : (isModified(chord) ? '確定して保存' : '確定済み') }}</span>
                  </button>
                </div>

                <div class="flex items-center space-x-1">
                  <div class="shrink-0 w-20 h-14 flex items-center justify-center">
                    <img 
                      v-if="chord.scoreImage" 
                      :src="chord.scoreImage" 
                      :alt="formatChordName(chord)"
                      class="h-full w-auto object-contain"
                    >
                    <div v-else class="text-[8px] font-black text-gray-200">NO IMAGE</div>
                  </div>
                  <div class="relative w-16 h-16 shrink-0 group">
                    <div 
                      class="w-full h-full rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center text-[9px] font-black"
                      :style="{ 
                        backgroundColor: draftMappings[chord.id]?.color || chord.color,
                        color: (parseInt((draftMappings[chord.id]?.color || chord.color).slice(1, 3), 16) * 299 + parseInt((draftMappings[chord.id]?.color || chord.color).slice(3, 5), 16) * 587 + parseInt((draftMappings[chord.id]?.color || chord.color).slice(5, 7), 16) * 114) / 1000 > 180 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'
                      }"
                    >
                      {{ draftMappings[chord.id]?.color || chord.color }}
                    </div>
                    <input 
                      type="color" 
                      :value="draftMappings[chord.id]?.color || chord.color"
                      @input="(e) => updateDraft(chord.id, { color: (e.target as HTMLInputElement).value })"
                      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                  </div>
                  <div class="flex-grow min-w-0">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-1">再生ナレーション</p>
                    <div class="relative">
                      <select 
                        :value="draftMappings[chord.id]?.colorName || chord.colorName"
                        @change="(e) => updateDraft(chord.id, { colorName: (e.target as HTMLSelectElement).value })"
                        class="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-700 focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                      >
                        <option v-for="preset in NARRATION_PRESETS" :key="preset" :value="preset">
                          {{ formatColorName(preset) }}
                        </option>
                      </select>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="shrink-0 flex flex-col items-center justify-center pl-2 space-y-1">
                    <p class="text-[8px] font-black text-gray-400 uppercase leading-none">Home表示</p>
                    <button 
                      @click="handleToggleHome(chord)"
                      type="button"
                      class="w-10 h-6 rounded-full relative transition-all duration-300 active:scale-90"
                      :class="draftMappings[chord.id]?.homeEnabled ? 'bg-indigo-500' : 'bg-gray-200'"
                    >
                      <div 
                        class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
                        :class="draftMappings[chord.id]?.homeEnabled ? 'translate-x-4' : 'translate-x-0'"
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Subscription Management -->
        <section class="space-y-6 mb-20">
          <div class="flex items-center space-x-2">
            <span class="w-1 h-5 bg-amber-500 rounded-full"></span>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">アカウント・プラン</h3>
          </div>

          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-1">
              <h4 class="text-sm font-black text-gray-900">
                現在のプラン: {{ userTier === 'premium' ? 'プレミアム' : (userTier === 'standard' ? 'スタンダード' : (userTier === 'entry' ? 'エントリー' : '無料')) }}プラン
              </h4>
              <p class="text-[10px] font-bold text-gray-400">プランの変更や解約はマイページから行えます</p>
            </div>
            
            <NuxtLink 
              to="/account"
              class="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl font-black text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              <span>マイページで管理する</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </section>

        <!-- Save Success Toast -->
        <Transition name="fade">
          <div v-if="showSaveSuccess" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div class="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>設定を保存しました</span>
            </div>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
@keyframes pulse-subtle {
  0%, 100% { border-color: rgb(99 102 241); }
  50% { border-color: rgb(165 180 252); }
}
.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite ease-in-out;
}
</style>
