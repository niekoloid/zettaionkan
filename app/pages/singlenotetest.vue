<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import * as Tone from 'tone'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database.types'
import { useAudio } from '~/composables/useAudio'
import { useAuth } from '~/composables/useAuth'
import { useAudioSettings } from '~/composables/useAudioSettings'
import type { NoteDefinition, HistoryItem } from '~/types/app'

const supabase = useSupabaseClient<Database>()
const router = useRouter()

const NOTE_DEFINITIONS: NoteDefinition[] = [
  // --- Octave 3 (C3-B3) -> Labeled as Octave 1 ---
  { id: 'c3', name: 'ド (C)', octave: 1, notes: ['C3'], label: 'C', abc: 'C,', sortOrder: 1, clef: 'bass' },
  { id: 'cis3', name: 'ド# (C#)', octave: 1, notes: ['C#3'], label: 'C#', abc: '^C,', sortOrder: 2, clef: 'bass' },
  { id: 'd3', name: 'レ (D)', octave: 1, notes: ['D3'], label: 'D', abc: 'D,', sortOrder: 3, clef: 'bass' },
  { id: 'dis3', name: 'レ# (D#)', octave: 1, notes: ['D#3'], label: 'D#', abc: '^D,', sortOrder: 4, clef: 'bass' },
  { id: 'e3', name: 'ミ (E)', octave: 1, notes: ['E3'], label: 'E', abc: 'E,', sortOrder: 5, clef: 'bass' },
  { id: 'f3', name: 'ファ (F)', octave: 1, notes: ['F3'], label: 'F', abc: 'F,', sortOrder: 6, clef: 'bass' },
  { id: 'fis3', name: 'ファ# (F#)', octave: 1, notes: ['F#3'], label: 'F#', abc: '^F,', sortOrder: 7, clef: 'bass' },
  { id: 'g3', name: 'ソ (G)', octave: 1, notes: ['G3'], label: 'G', abc: 'G,', sortOrder: 8, clef: 'bass' },
  { id: 'gis3', name: 'ソ# (G#)', octave: 1, notes: ['G#3'], label: 'G#', abc: '^G,', sortOrder: 9, clef: 'bass' },
  { id: 'a3', name: 'ラ (A)', octave: 1, notes: ['A3'], label: 'A', abc: 'A,', sortOrder: 10, clef: 'treble' },
  { id: 'ais3', name: 'ラ# (A#)', octave: 1, notes: ['A#3'], label: 'A#', abc: '^A,', sortOrder: 11, clef: 'treble' },
  { id: 'b3', name: 'シ (B)', octave: 1, notes: ['B3'], label: 'B', abc: 'B,', sortOrder: 12, clef: 'treble' },
  // --- Octave 4 (C4-B4) -> Labeled as Octave 2 ---
  { id: 'c4', name: 'ド (C)', octave: 2, notes: ['C4'], label: 'C', abc: 'C', sortOrder: 13, clef: 'treble' },
  { id: 'cis4', name: 'ド# (C#)', octave: 2, notes: ['C#4'], label: 'C#', abc: '^C', sortOrder: 14, clef: 'treble' },
  { id: 'd4', name: 'レ (D)', octave: 2, notes: ['D4'], label: 'D', abc: 'D', sortOrder: 15, clef: 'treble' },
  { id: 'dis4', name: 'レ# (D#)', octave: 2, notes: ['D#4'], label: 'D#', abc: '^D', sortOrder: 16, clef: 'treble' },
  { id: 'e4', name: 'ミ (E)', octave: 2, notes: ['E4'], label: 'E', abc: 'E', sortOrder: 17, clef: 'treble' },
  { id: 'f4', name: 'ファ (F)', octave: 2, notes: ['F4'], label: 'F', abc: 'F', sortOrder: 18, clef: 'treble' },
  { id: 'fis4', name: 'ファ# (F#)', octave: 2, notes: ['F#4'], label: 'F#', abc: '^F', sortOrder: 19, clef: 'treble' },
  { id: 'g4', name: 'ソ (G)', octave: 2, notes: ['G4'], label: 'G', abc: 'G', sortOrder: 20, clef: 'treble' },
  { id: 'gis4', name: 'ソ# (G#)', octave: 2, notes: ['G#4'], label: 'G#', abc: '^G', sortOrder: 21, clef: 'treble' },
  { id: 'a4', name: 'ラ (A)', octave: 2, notes: ['A4'], label: 'A', abc: 'A', sortOrder: 22, clef: 'treble' },
  { id: 'ais4', name: 'ラ# (A#)', octave: 2, notes: ['A#4'], label: 'A#', abc: '^A', sortOrder: 23, clef: 'treble' },
  { id: 'b4', name: 'シ (B)', octave: 2, notes: ['B4'], label: 'B', abc: 'B', sortOrder: 24, clef: 'treble' },
  // --- Octave 5 (C5-B5) -> Labeled as Octave 3 ---
  { id: 'c5', name: 'ド (C)', octave: 3, notes: ['C5'], label: 'C', abc: 'c', sortOrder: 25, clef: 'treble' },
  { id: 'cis5', name: 'ド# (C#)', octave: 3, notes: ['C#5'], label: 'C#', abc: '^c', sortOrder: 26, clef: 'treble' },
  { id: 'd5', name: 'レ (D)', octave: 3, notes: ['D5'], label: 'D', abc: 'd', sortOrder: 27, clef: 'treble' },
  { id: 'dis5', name: 'レ# (D#)', octave: 3, notes: ['D#5'], label: 'D#', abc: '^d', sortOrder: 28, clef: 'treble' },
  { id: 'e5', name: 'ミ (E)', octave: 3, notes: ['E5'], label: 'E', abc: 'e', sortOrder: 29, clef: 'treble' },
  { id: 'f5', name: 'ファ (F)', octave: 3, notes: ['F5'], label: 'F', abc: 'f', sortOrder: 30, clef: 'treble' },
  { id: 'fis5', name: 'ファ# (F#)', octave: 3, notes: ['F#5'], label: 'F#', abc: '^f', sortOrder: 31, clef: 'treble' },
  { id: 'g5', name: 'ソ (G)', octave: 3, notes: ['G5'], label: 'G', abc: 'g', sortOrder: 32, clef: 'treble' },
  { id: 'gis5', name: 'ソ# (G#)', octave: 3, notes: ['G#5'], label: 'G#', abc: '^g', sortOrder: 33, clef: 'treble' },
  { id: 'a5', name: 'ラ (A)', octave: 3, notes: ['A5'], label: 'A', abc: 'a', sortOrder: 34, clef: 'treble' },
  { id: 'ais5', name: 'ラ# (A#)', octave: 3, notes: ['A#5'], label: 'A#', abc: '^a', sortOrder: 35, clef: 'treble' },
  { id: 'b5', name: 'シ (B)', octave: 3, notes: ['B5'], label: 'B', abc: 'b', sortOrder: 36, clef: 'treble' },
]

const QUIZ_LENGTH = 5

const DELAYS = {
  PLAYBACK_START: 500,
  TRANSITION: 400,
  FEEDBACK: 800
}

// === Reactive State ===
const view = ref<'settings' | 'quiz' | 'result'>('settings')
const score = ref(0)
const isSaving = ref(false)
const currentQuestionIndex = ref(0)
const resultMessage = ref<'correct' | 'incorrect' | null>(null)
const userAnswer = ref<NoteDefinition | null>(null)
const activeKeys = ref<Set<string>>(new Set())
const NOTE_QUIZZ_SETTINGS_KEY = 'zettaionkan_note_quizz_settings'

interface NoteQuizzSettings {
  selectedNoteIds: string[]
  matchOctave: boolean
  includeBlackKeys: boolean
  testAll88: boolean
}

const noteQuizzCookie = useCookie<NoteQuizzSettings>(NOTE_QUIZZ_SETTINGS_KEY, {
  default: () => ({
    selectedNoteIds: NOTE_DEFINITIONS.map(n => n.id),
    matchOctave: false,
    includeBlackKeys: false,
    testAll88: false
  }),
  maxAge: 60 * 60 * 24 * 365 * 100 // 100 years
})

const selectedNoteIds = ref<Set<string>>(new Set(noteQuizzCookie.value.selectedNoteIds))
const questions = ref<NoteDefinition[]>([])
const quizzHistory = ref<HistoryItem[]>([])
const shuffledIds = ref<string[]>([])
const matchOctave = ref(noteQuizzCookie.value.matchOctave)
const includeBlackKeys = ref(noteQuizzCookie.value.includeBlackKeys)
const testAll88 = ref(noteQuizzCookie.value.testAll88)
const isQuestionChanging = ref(false)

const syncToCookie = () => {
  noteQuizzCookie.value = {
    selectedNoteIds: Array.from(selectedNoteIds.value),
    matchOctave: matchOctave.value,
    includeBlackKeys: includeBlackKeys.value,
    testAll88: testAll88.value
  }
}

const J_NAMES: Record<string, string> = { 'C': 'ド', 'D': 'レ', 'E': 'ミ', 'F': 'ファ', 'G': 'ソ', 'A': 'ラ', 'B': 'シ' }

const toggleTestAll88 = () => {
  if (!isPro.value) {
    navigateToSubscription()
    return
  }
  testAll88.value = !testAll88.value
}

const toggleIncludeBlackKeys = () => {
  if (!isPro.value) {
    navigateToSubscription()
    return
  }
  includeBlackKeys.value = !includeBlackKeys.value
}

const toggleMatchOctave = () => {
  if (!isPro.value) {
    navigateToSubscription()
    return
  }
  matchOctave.value = !matchOctave.value
}

watch(testAll88, (newVal) => {
  if (newVal) {
    includeBlackKeys.value = true
  }
})

const FULL_PIANO_NOTES = computed<NoteDefinition[]>(() => {
  const notes: NoteDefinition[] = []
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  // A0, A#0, B0
  const lowNotes = ['A', 'A#', 'B']
  for (const n of lowNotes) {
    const noteName = `${n}0`
    const baseChar = n[0]
    const jBase = J_NAMES[baseChar!] || ''
    const isSharp = n.includes('#')
    notes.push({
      id: noteName.toLowerCase().replace('#', 'is'),
      name: isSharp ? `${jBase}# (${n})` : `${jBase} (${n})`,
      octave: 0,
      notes: [noteName],
      label: n,
      abc: n === 'A' ? 'A,,,,' : (n === 'A#' ? '^A,,,,' : 'B,,,,'),
      sortOrder: n === 'A' ? 1 : (n === 'A#' ? 2 : 3),
      clef: 'bass'
    })
  }

  for (let oct = 1; oct <= 7; oct++) {
    for (const n of names) {
      const noteName = `${n}${oct}`
      const baseChar = n[0]
      const jBase = J_NAMES[baseChar!] || ''
      const isSharp = n.includes('#')
      
      // ABC notation logic
      const accidental = isSharp ? '^' : ''
      const letter = baseChar
      let abc = ''
      if (oct === 1) abc = accidental + letter + ',,,'
      else if (oct === 2) abc = accidental + letter + ',,'
      else if (oct === 3) abc = accidental + letter + ','
      else if (oct === 4) abc = accidental + letter
      else if (oct === 5) abc = accidental + letter!.toLowerCase()
      else if (oct === 6) abc = accidental + letter!.toLowerCase() + "'"
      else if (oct === 7) abc = accidental + letter!.toLowerCase() + "''"

      // Clef logic
      let clef: 'bass' | 'treble' = 'treble'
      if (oct < 3) clef = 'bass'
      else if (oct === 3) {
        const pitchIdx = names.indexOf(n)
        if (pitchIdx <= 8) clef = 'bass' // C3 to G#3
      }

      notes.push({
        id: noteName.toLowerCase().replace('#', 'is'),
        name: isSharp ? `${jBase}# (${n})` : `${jBase} (${n})`,
        octave: oct,
        notes: [noteName],
        label: n,
        abc: abc,
        sortOrder: notes.length + 1,
        clef: clef
      })
    }
  }

  // C8
  notes.push({
    id: 'c8',
    name: 'ド (C8)',
    octave: 8,
    notes: ['C8'],
    label: 'C',
    abc: "c'''",
    sortOrder: notes.length + 1,
    clef: 'treble'
  })

  return notes
})

const { 
  samplers, 
  isLoading, 
  loadingProgress, 
  isSamplerLoaded, 
  selectedInstrument, 
  loadSampler 
} = useAudio()

// === Computed ===
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const currentQuestionCount = computed(() => currentQuestionIndex.value + 1)


const availableNotes = computed(() => {
  // Determine which base set to use
  const baseSet = testAll88.value ? FULL_PIANO_NOTES.value : NOTE_DEFINITIONS
  
  // Filter by user selection if not in 88-key mode
  let filtered = baseSet.filter(n => testAll88.value || selectedNoteIds.value.has(n.id))
  
  // Filter for white keys only if black keys NOT included
  if (!includeBlackKeys.value) {
    filtered = filtered.filter(n => !n.name.includes('#') && !n.name.includes('b'))
  }
  return filtered
})

interface OctaveGroup {
  octave: number | null
  label?: string
  white: NoteDefinition[]
  black: NoteDefinition[]
}

const quizNotesByOctave = computed<OctaveGroup[]>(() => {
  if (matchOctave.value) {
    const octs = testAll88.value ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3]
    return octs.map(oct => ({
      octave: oct,
      label: oct === 0 ? '超低音' : (testAll88.value ? `Octave ${oct}` : (oct === 1 ? '低音域' : oct === 2 ? '中音域' : '高音域')),
      white: availableNotes.value.filter(n => n.octave === oct && !n.name.includes('#')),
      black: availableNotes.value.filter(n => n.octave === oct && n.name.includes('#'))
    })).filter(o => o.white.length > 0 || o.black.length > 0)
  } else {
    // Collect unique note names (ignoring octave)
    const white: NoteDefinition[] = []
    const black: NoteDefinition[] = []
    const seenWhite = new Set<string>()
    const seenBlack = new Set<string>()

    // Sort by pitch class (0-11)
    const sortedSelected = [...availableNotes.value].sort((a, b) => (a.sortOrder - 1) % 12 - (b.sortOrder - 1) % 12)

    sortedSelected.forEach(n => {
      const isBlack = n.name.includes('#')
      const pureName = n.name.split(' ')[0]! // e.g. "ド"
      if (isBlack) {
        if (!seenBlack.has(pureName)) {
          seenBlack.add(pureName)
          black.push(n)
        }
      } else {
        if (!seenWhite.has(pureName)) {
          seenWhite.add(pureName)
          white.push(n)
        }
      }
    })

    return [{
      octave: null,
      white,
      black
    }]
  }
})

const gridCols = computed(() => {
  return 4 // Fixed for white keys in quiz
})

const gridRows = computed(() => {
  return Math.ceil(availableNotes.value.length / gridCols.value)
})

// === Core Logic ===
const playCurrentQuestion = async () => {
  const s = samplers[selectedInstrument.value]
  if (!s || !isSamplerLoaded.value) return
  if (Tone.context.state !== 'running') await Tone.start()
  
  const noteObj = currentQuestion.value
  if (!noteObj) return
  const notes = noteObj.notes
  
  s.triggerAttackRelease(notes, 8)
}

const playSingleNote = async (noteName: string) => {
  const s = samplers[selectedInstrument.value]
  if (!s || !isSamplerLoaded.value) return
  if (Tone.context.state !== 'running') await Tone.start()
  
  const normalized = normalizeNote(noteName)
  activeKeys.value.add(normalized)
  s.triggerAttackRelease(noteName, 8)
  
  // Quiz mode: Submit answer via keyboard
  if (view.value === 'quiz' && !resultMessage.value) {
    const pool = testAll88.value ? FULL_PIANO_NOTES.value : NOTE_DEFINITIONS
    const noteObj = pool.find(n => normalizeNote(n.notes[0]!) === normalized)
    if (noteObj) {
      submitAnswer(noteObj)
    }
  }

  setTimeout(() => {
    activeKeys.value.delete(normalized)
  }, 8000)
}

const shuffleNotes = () => {
  const ids = availableNotes.value.map(n => n.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = ids[i]!
    ids[i] = ids[j]!
    ids[j] = temp
  }
  shuffledIds.value = ids
}

const startQuizz = async () => {
  // Ensure we have notes to play
  const notes = availableNotes.value
  if (notes.length === 0) return

  if (Tone.context.state !== 'running') {
    try {
      await Tone.start()
    } catch (e) {
      console.warn("Tone start failed, but continuing...", e)
    }
  }

  // Pre-pick 5 questions
  const quizSet: NoteDefinition[] = []
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    quizSet.push(notes[Math.floor(Math.random() * notes.length)]!)
  }
  
  questions.value = quizSet
  currentQuestionIndex.value = 0
  score.value = 0
  quizzHistory.value = []
  
  shuffleNotes()
  
  resultMessage.value = null
  userAnswer.value = null
  view.value = 'quiz'
  
  setTimeout(playCurrentQuestion, DELAYS.PLAYBACK_START)
}

const moveNext = () => {
  if (view.value !== 'quiz') return
  const available = availableNotes.value
  questions.value.push(available[Math.floor(Math.random() * available.length)]!)
  currentQuestionIndex.value++
  resultMessage.value = null
  shuffleNotes()
  
  setTimeout(playCurrentQuestion, DELAYS.TRANSITION)
}

const submitAnswer = (note: NoteDefinition) => {
  if (resultMessage.value) return 

  if (!currentQuestion.value) return

  userAnswer.value = note
  const isCorrect = matchOctave.value 
    ? note.id === currentQuestion.value.id
    : note.name === currentQuestion.value.name
    
  if (isCorrect) score.value++
  
  if (currentQuestion.value) {
    quizzHistory.value.push({
      question: { ...currentQuestion.value },
      answer: { ...note, isCorrect },
      isCorrect,
      isSkipped: false
    })
  }

  // Provide haptic-like short feedback wait
  if (currentQuestionIndex.value < QUIZ_LENGTH - 1) {
    isQuestionChanging.value = true
    setTimeout(() => {
      currentQuestionIndex.value++
      userAnswer.value = null
      isQuestionChanging.value = false
      playCurrentQuestion()
    }, DELAYS.FEEDBACK)
  } else {
    setTimeout(finishQuizz, DELAYS.FEEDBACK)
  }
}

const skipQuestion = () => {
  if (resultMessage.value) return

  if (currentQuestion.value) {
    quizzHistory.value.push({
      question: { ...currentQuestion.value },
      answer: null,
      isCorrect: false,
      isSkipped: true
    })
  }

  if (currentQuestionIndex.value < QUIZ_LENGTH - 1) {
    isQuestionChanging.value = true
    setTimeout(() => {
      currentQuestionIndex.value++
      userAnswer.value = null
      isQuestionChanging.value = false
      playCurrentQuestion()
    }, DELAYS.TRANSITION)
  } else {
    setTimeout(finishQuizz, DELAYS.TRANSITION)
  }
}

const finishQuizz = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user && quizzHistory.value.length > 0) {
    isSaving.value = true
    try {
      // @ts-ignore: Supabase types mismatch workaround
      await supabase.from('training_sessions').insert({
        user_id: user.id,
        score: score.value,
        total_questions: quizzHistory.value.length,
        details: quizzHistory.value as any, // Cast to any to avoid complex Json mapping issues for now
        settings: {
           mode: 'single_note_quizz',
           selected_notes: Array.from(selectedNoteIds.value),
           instrument: selectedInstrument.value
        }
      })
    } catch (e) {
      console.error('Failed to save session:', e)
    } finally {
      isSaving.value = false
    }
  }
  view.value = 'result'
}

const resetQuizz = () => {
  view.value = 'settings'
  resultMessage.value = null
}

const handleHeaderBack = (e: Event) => {
  if (view.value !== 'settings') {
    e.preventDefault()
    resetQuizz()
  }
}

onBeforeRouteLeave((to, from) => {
  if (view.value !== 'settings') {
    resetQuizz()
    return false
  }
})

const { user, userTier, authReady } = useAuth()

// Piano Keyboard Data for Visualization (C4-A6 Range)
interface KeyboardKey {
  note: string
  type: 'white' | 'black'
}
const keyboardNotes: KeyboardKey[] = [
  { note: 'C3', type: 'white' }, { note: 'C#3', type: 'black' },
  { note: 'D3', type: 'white' }, { note: 'D#3', type: 'black' },
  { note: 'E3', type: 'white' },
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
  { note: 'G5', type: 'white' }, { note: 'G#5', type: 'black' },
  { note: 'A5', type: 'white' }, { note: 'A#5', type: 'black' },
  { note: 'B5', type: 'white' }
]

const pianoScrollContainer = ref<HTMLElement | null>(null)

const normalizeNote = (note: string) => {
  return note.replace('C#', 'Db').replace('D#', 'Eb').replace('F#', 'Gb').replace('G#', 'Ab').replace('A#', 'Bb')
}

// Fixed range keyboard for standard mode
const whiteNotesForKeyboard = computed(() => keyboardNotes.filter(n => n.type === 'white').map(n => n.note))
const isNotePressed = (note: string) => {
  return activeKeys.value.has(normalizeNote(note))
}

const isNoteCorrect = (note: string) => {
  if (!resultMessage.value || !currentQuestion.value) return false
  const normalized = normalizeNote(note)
  const questionNote = currentQuestion.value.notes[0]
  if (!questionNote) return false
  
  if (matchOctave.value) {
    return normalizeNote(questionNote) === normalized
  } else {
    // Check pitch class only (remove any trailing digits for octave)
    const qPc = normalizeNote(questionNote).replace(/\d+$/, '')
    const nPc = normalized.replace(/\d+$/, '')
    return qPc === nPc
  }
}

const isNoteWrong = (note: string) => {
  if (resultMessage.value !== 'incorrect' || !userAnswer.value) return false
  const normalized = normalizeNote(note)
  const answerNote = userAnswer.value.notes[0]
  if (!answerNote) return false
  
  if (matchOctave.value) {
    return normalizeNote(answerNote) === normalized
  } else {
    const aPc = normalizeNote(answerNote).replace(/\d+$/, '')
    const nPc = normalized.replace(/\d+$/, '')
    // Wrong if pitch class matches the user's answer but is not actually correct
    return aPc === nPc && !isNoteCorrect(note)
  }
}

const isNoteActiveOnKeyboard = (note: string) => {
  return isNotePressed(note) || isNoteCorrect(note) || isNoteWrong(note)
}
const hasBlackKey = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  return !['B', 'E'].includes(noteName)
}
const getBlackKeyNote = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  const match = whiteNote.match(/\d/)
  const octave = match ? match[0] : ''
  return `${noteName}#${octave}`
}

const has88BlackKey = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  return !['B', 'E'].includes(noteName)
}

const get88BlackKeyNote = (whiteNote: string) => {
  const noteName = whiteNote.replace(/\d/, '')
  const match = whiteNote.match(/\d/)
  const octave = match ? match[0] : ''
  return `${noteName}#${octave}`
}

// Full 88 Keys for visualization
interface Piano88Key {
  id: string
  type: 'white' | 'black'
}
const piano88Keys = computed<Piano88Key[]>(() => {
  const keys: Piano88Key[] = []
  // A0, Bb0, B0
  keys.push({ id: 'A0', type: 'white' })
  keys.push({ id: 'Bb0', type: 'black' })
  keys.push({ id: 'B0', type: 'white' })
  
  const names = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  for (let oct = 1; oct <= 7; oct++) {
    names.forEach(n => {
      keys.push({ id: `${n}${oct}`, type: n.includes('b') ? 'black' : 'white' })
    })
  }
  keys.push({ id: 'C8', type: 'white' })
  return keys
})

const is88NotePressed = (keyId: string) => {
  return activeKeys.value.has(normalizeNote(keyId))
}

const is88NoteCorrect = (keyId: string) => isNoteCorrect(keyId)
const is88NoteWrong = (keyId: string) => isNoteWrong(keyId)

const is88NoteActive = (keyId: string) => {
  return is88NotePressed(keyId) || is88NoteCorrect(keyId) || is88NoteWrong(keyId)
}

// Auto-scroll logic for 88-key piano
watch(resultMessage, (msg) => {
  if (msg && testAll88.value && pianoScrollContainer.value) {
    if (currentQuestion.value && currentQuestion.value.notes.length > 0) {
      const activeNote = currentQuestion.value.notes[0]
      if (activeNote) {
        const activeIndex = piano88Keys.value.findIndex(k => normalizeNote(k.id) === normalizeNote(activeNote))
        
        if (activeIndex !== -1) {
          const keyWidth = 12
          const scrollPos = (activeIndex * keyWidth) - (pianoScrollContainer.value.clientWidth / 2)
          pianoScrollContainer.value.scrollTo({
            left: Math.max(0, scrollPos),
            behavior: 'smooth'
          })
        }
      }
    }
  }
})

onMounted(async () => {
  // Initial sampler load
  await authReady
  const { getPreferredInstrument } = useAudioSettings()
  let preferred = getPreferredInstrument(userTier.value)

  // Safeguard
  if (preferred === 'steinway' && userTier.value !== "premium") {
    preferred = 'yamaha'
  }
  
  loadSampler(preferred as 'yamaha' | 'steinway')
})

// === Watchers for Persistence ===
watch([selectedNoteIds, matchOctave, includeBlackKeys, testAll88], () => {
  syncToCookie()
}, { deep: true })

const { isPro: checkProAccess, isEnabled } = usePro()
const isPro = computed(() => checkProAccess(userTier.value))

const navigateToSubscription = () => {
    if (confirm('このオプションの変更はPROプラン限定です。プランを確認しますか？')) {
        router.push('/subscription')
    }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Noto_Sans_JP'] antialiased" style="backface-visibility: hidden;">
    <div class="min-h-screen flex flex-col items-center mx-auto relative overflow-hidden transition-all duration-500"
         :class="testAll88 && view === 'quiz' ? 'max-w-none w-full' : 'max-w-3xl'">

      <AppHeader showBack @back="handleHeaderBack" />

      <main class="w-full flex-grow flex flex-col scrollbar-hide" 
            :class="view === 'quiz' ? 'p-0 overflow-hidden' : 'px-4 py-6 overflow-y-auto'"
            style="scrollbar-gutter: stable;">
        
        <!-- SETTINGS VIEW -->
        <div v-if="view === 'settings'" class="space-y-8 pb-40">
          <div class="text-center mb-6">
              <h2 class="text-xl font-black text-gray-900">単音テスト</h2>
              <p class="text-xs text-gray-400 mt-1 font-bold">一音ずつの響きを聴き取ってみましょう</p>
          </div>



          <div class="px-2">
            <button @click="startQuizz" :disabled="availableNotes.length === 0"
                    class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 border-b-4 border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              <span>テストを開始する</span>
            </button>
          </div>



          <section class="space-y-4 px-1">
            <label v-if="isEnabled('singlenote_setting_white_keys') || isEnabled('singlenote_setting_match_octave') || isEnabled('singlenote_setting_88_keys')" class="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">オプション</label>
            
            <!-- Include Black Keys Toggle -->
            <div 
              v-if="isEnabled('singlenote_setting_white_keys')"
              @click="toggleIncludeBlackKeys"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-all hover:bg-gray-100 active:bg-gray-200 mb-2 relative z-10"
              :class="!isPro ? 'opacity-80' : ''"
            >
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-black text-gray-900">黒鍵も含めてテストする</p>
                  <span v-if="!isPro" class="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2 mr-1" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    PRO
                  </span>
                </div>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">黒鍵（変記号・嬰記号）もランダムに出題されるようになります</p>
              </div>
              <div class="pointer-events-none">
                <div class="w-10 h-6 rounded-full transition-colors relative"
                     :class="includeBlackKeys ? 'bg-indigo-600' : 'bg-gray-200'">
                  <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                       :class="includeBlackKeys ? 'translate-x-4' : ''"></div>
                </div>
              </div>
            </div>

            <!-- Octave Matching Toggle -->
            <div 
              v-if="isEnabled('singlenote_setting_match_octave')"
              @click="toggleMatchOctave"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-all hover:bg-gray-100 active:bg-gray-200 mb-2 relative z-10"
              :class="!isPro ? 'opacity-80' : ''"
            >
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-black text-gray-900">オクターブまで一致させる</p>
                  <span v-if="!isPro" class="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2 mr-1" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    PRO
                  </span>
                </div>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">同じ音名でもオクターブが違うと不正解になります</p>
              </div>
              <div class="pointer-events-none">
                <div class="w-10 h-6 rounded-full transition-colors relative"
                     :class="matchOctave ? 'bg-indigo-600' : 'bg-gray-200'">
                  <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                       :class="matchOctave ? 'translate-x-4' : ''"></div>
                </div>
              </div>
            </div>

            <!-- All 88 Keys Toggle -->
            <div 
              v-if="isEnabled('singlenote_setting_88_keys')"
              @click="toggleTestAll88"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer transition-all hover:bg-gray-100 active:bg-gray-200 mb-2 relative z-10"
              :class="!isPro ? 'opacity-80' : ''"
            >
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-black text-gray-900">全88鍵盤でテストする</p>
                  <span v-if="!isPro" class="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2 mr-1" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    PRO
                  </span>
                </div>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">ピアノの全音域からランダムに出題されます</p>
              </div>
              <div class="pointer-events-none">
                <div class="w-10 h-6 rounded-full transition-colors relative"
                     :class="testAll88 ? 'bg-indigo-600' : 'bg-gray-200'">
                  <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                       :class="testAll88 ? 'translate-x-4' : ''"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- QUIZ VIEW -->
        <div v-if="view === 'quiz'" class="flex-grow w-full flex flex-col bg-gray-50 relative pt-16">
          <!-- Top Progress Bar -->
          <div class="fixed top-0 left-0 right-0 z-[60] h-1.5 bg-gray-200/50 backdrop-blur-sm">
            <div class="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
                 :class="{ 'brightness-150 h-2': isQuestionChanging }"
                 :style="{ width: `${(currentQuestionCount / QUIZ_LENGTH) * 100}%` }"></div>
          </div>

          <div class="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
            <div class="flex items-center space-x-2">
              <div class="flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg overflow-hidden h-8 transition-all duration-300"
                   :class="{ 'scale-125 ring-4 ring-indigo-500/50 bg-indigo-900/60': isQuestionChanging }">
                <div class="px-3 h-full flex items-center bg-white/10 border-r border-white/5">
                  <span class="text-[8px] text-gray-300 font-black uppercase tracking-widest leading-none">Question</span>
                </div>
                <div class="px-4 h-full flex items-center min-w-[3rem] justify-center text-white text-[11px] font-black">
                  {{ currentQuestionCount }} / {{ QUIZ_LENGTH }}
                </div>
              </div>
            </div>
            <button @click="finishQuizz"
                    class="pointer-events-auto bg-black/40 backdrop-blur-md text-[10px] text-white font-black rounded-full px-4 h-8 hover:bg-black/50 transition-colors border border-white/10 shadow-lg flex items-center">
              テストを終了
            </button>
          </div>

          <!-- Feedback Overlay -->
          <Transition name="feedback-pop">
            <div v-if="userAnswer" class="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <div v-if="matchOctave && userAnswer && currentQuestion ? userAnswer.id === currentQuestion.id : (userAnswer && currentQuestion ? userAnswer.name === currentQuestion.name : false)" 
                   class="text-[250px] sm:text-[350px] font-black text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] select-none leading-none">
                ◯
              </div>
              <div v-else 
                   class="text-[250px] sm:text-[350px] font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] select-none leading-none">
                ×
              </div>
            </div>
          </Transition>

          <Transition name="slide-fade" mode="out-in">
            <div :key="currentQuestionIndex" class="flex-grow flex flex-col overflow-hidden pt-12">
              <!-- 1. Piano Visualization -->
              <div class="w-full" :class="testAll88 ? 'px-0' : 'px-4'">
                <div class="w-full bg-white rounded-t-3xl p-5 border-y border-gray-100 flex flex-col items-center shadow-sm">
                  
                  <!-- Standard Piano (3 Octaves) -->
                  <div v-if="!testAll88" class="relative flex justify-center h-36 w-full bg-gray-50 p-1 rounded-xl shadow-inner border border-gray-200">
                    <!-- White Keys -->
                    <div 
                      v-for="note in whiteNotesForKeyboard" 
                      :key="note"
                      @click="playSingleNote(note)"
                      class="relative flex-grow border-x-[0.1px] border-gray-100 first:border-l-0 last:border-r-0 rounded-b-sm transition-all duration-300 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                      :class="[
                        isNotePressed(note) ? 'bg-gray-200 z-10 scale-y-[1.02] shadow-sm' : 
                        isNoteCorrect(note) ? 'bg-indigo-500 z-10 scale-y-[1.02] shadow-md' : 
                        isNoteWrong(note) ? 'bg-rose-500 z-10 scale-y-[1.02] shadow-md' : 'bg-white'
                      ]"
                    >
                      <div v-if="note === 'C4'" class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-black text-gray-400">C4</div>
                    </div>
                    <!-- Black Keys Overlay -->
                    <div class="absolute inset-x-1 top-1 h-20 pointer-events-none flex">
                      <div v-for="(note, index) in keyboardNotes.filter(n => n.type === 'white')" :key="'gap-'+index" class="flex-grow relative h-full">
                        <div 
                          v-if="hasBlackKey(note.note)"
                          @click.stop="playSingleNote(getBlackKeyNote(note.note))"
                          class="absolute right-0 translate-x-1/2 w-3/5 h-full rounded-b-sm border-x border-b border-gray-800 transition-all duration-300 z-20 pointer-events-auto cursor-pointer"
                          :class="[
                            isNotePressed(getBlackKeyNote(note.note)) ? 'bg-gray-600 scale-[1.05] z-30 shadow-sm' :
                            isNoteCorrect(getBlackKeyNote(note.note)) ? 'bg-amber-400 z-30 scale-[1.1] shadow-md' : 
                            isNoteWrong(getBlackKeyNote(note.note)) ? 'bg-rose-400 z-30 scale-[1.1] shadow-md' : 'bg-gray-800'
                          ]"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- 88-Key Piano Visualization -->
                  <div v-else class="w-full py-2 overflow-hidden px-1" ref="pianoScrollContainer">
                    <div class="relative flex h-44 w-full bg-gray-950 p-1 rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                      <!-- White Keys (52 total) -->
                      <div class="absolute inset-0 flex px-1 py-1">
                        <div 
                          v-for="key in piano88Keys.filter(k => k.type === 'white')" 
                          :key="key.id"
                          @click="playSingleNote(key.id)"
                          class="flex-grow h-full border-x-[0.1px] border-gray-800 first:border-l-0 last:border-r-0 rounded-b-[1px] transition-all duration-300 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                          :class="[
                            is88NotePressed(key.id) ? 'bg-gray-200 z-10 scale-y-[1.02] shadow-sm' :
                            is88NoteCorrect(key.id) ? 'bg-blue-400 z-10 scale-y-[1.02] shadow-md' : 
                            is88NoteWrong(key.id) ? 'bg-rose-500 z-10 scale-y-[1.02] shadow-md' : 'bg-white'
                          ]"
                        ></div>
                      </div>
                      <!-- Black Keys Overlay (36 total) -->
                      <div class="absolute inset-x-0 top-1 h-28 pointer-events-none px-1 flex">
                        <div v-for="(key, index) in piano88Keys.filter(k => k.type === 'white')" :key="'gap-'+key.id" class="flex-grow relative h-full">
                          <div 
                            v-if="has88BlackKey(key.id)"
                            @click.stop="playSingleNote(get88BlackKeyNote(key.id))"
                            class="absolute right-0 translate-x-1/2 w-[70%] h-full rounded-b-[1px] border-x border-b border-gray-900 transition-all duration-300 z-20 pointer-events-auto cursor-pointer"
                            :class="[
                              is88NotePressed(get88BlackKeyNote(key.id)) ? 'bg-gray-700 scale-[1.05] z-30 shadow-sm' :
                              is88NoteCorrect(get88BlackKeyNote(key.id)) ? 'bg-blue-600 z-30 scale-[1.1] shadow-md' : 
                              is88NoteWrong(get88BlackKeyNote(key.id)) ? 'bg-rose-400 z-30 scale-[1.1] shadow-md' : 'bg-gray-900'
                            ]"
                          ></div>
                        </div>
                      </div>
                      <!-- Mid C Marker -->
                      <div class="absolute inset-x-0 bottom-1 pointer-events-none px-1 flex">
                        <div v-for="key in piano88Keys.filter(k => k.type === 'white')" :key="'label-'+key.id" class="flex-grow relative h-4">
                          <span v-if="key.id === 'C4'" class="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-black text-gray-400">C4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- RESULT VIEW -->
        <div v-if="view === 'result'" class="space-y-8 flex flex-col items-center justify-center min-h-[60vh] pb-32">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-black text-gray-900">結果発表</h2>
            <div class="text-6xl font-black text-indigo-600 mt-4">{{ score }} / {{ QUIZ_LENGTH }}</div>
            <p class="text-sm font-bold text-gray-400">正解数</p>
          </div>

          <div class="w-full max-w-sm space-y-3 px-4">
            <div v-for="(history, i) in quizzHistory" :key="i"
                 class="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div class="flex items-center space-x-4">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm"
                     :class="history.isCorrect ? 'bg-green-500' : (history.isSkipped ? 'bg-gray-400' : 'bg-rose-500')">
                  {{ i + 1 }}
                </div>
                <div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-gray-400">正解</span>
                    <div class="flex items-baseline space-x-2">
                      <span class="text-sm font-black text-gray-900">{{ history.question.name }}</span>
                      <span class="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{{ history.question.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-gray-400 block">あなたの回答</span>
                <div class="flex items-baseline justify-end space-x-2">
                  <span class="text-sm font-black transition-colors" :class="history.isCorrect ? 'text-green-600' : 'text-rose-500'">
                    {{ history.answer ? history.answer.name : 'SKIP' }}
                  </span>
                  <span v-if="history.answer" class="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{{ history.answer.label }}</span>
                </div>
              </div>
              <div class="ml-4">
                <div v-if="history.isCorrect" class="text-green-500 text-2xl font-black">○</div>
                <div v-else-if="history.isSkipped" class="text-gray-300 text-lg font-black">−</div>
                <div v-else class="text-rose-500 text-2xl font-black">×</div>
              </div>
            </div>
          </div>

          <div class="w-full px-8 space-y-3">
            <button @click="startQuizz" 
                    class="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 border-b-4 border-indigo-800">
              もう一度挑戦する
            </button>
            <button @click="resetQuizz"
                    class="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
              設定に戻る
            </button>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.feedback-pop-enter-active,
.feedback-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.feedback-pop-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
.feedback-pop-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
