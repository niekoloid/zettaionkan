import type { Chord } from '~/constants/chords'

export interface NoteDefinition {
  id: string
  name: string
  octave: number
  notes: string[]
  label: string
  abc: string
  sortOrder: number
  clef: 'bass' | 'treble'
  color?: string
}

export interface Question extends NoteDefinition {
    // extending NoteDefinition for singlenotetest as typically questions are notes there
    // For other quizzes, we might need a Union type or separate interfaces
}

export interface Answer extends NoteDefinition {
  isCorrect?: boolean
}

export interface HistoryItem {
  question: Question | Chord
  answer: Answer | Chord | null
  isCorrect: boolean
  isSkipped?: boolean
}

export type SubscriptionTier = 'free' | 'entry' | 'standard' | 'premium'

export interface UserProfile {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  stripe_customer_id?: string
}

export interface AppSettings {
  namingConvention: 'italian' | 'german' | 'hybrid'
  instrument: string
  colorFormat: 'standard' | 'hiragana'
  isKeyboardSoundEnabled: boolean
}
