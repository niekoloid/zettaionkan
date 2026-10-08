import type { Chord } from '@/constants/chords'
import type { HistoryItem } from '@/types/app'

export interface GameModeProps {
  currentQuestion?: Chord | null
  choices?: Chord[]
  correctHistory?: HistoryItem[]
  userAnswer?: Chord | null
  isQuestionChanging?: boolean
  isAutoPlay?: boolean
  onAnswer?: (chord: Chord) => void
  onPlay?: (chord?: Chord | null) => void
  onReady?: () => void
}

export const gridColsFor = (count: number) =>
  count <= 4 ? 'grid-cols-2'
    : count <= 6 ? 'grid-cols-3'
      : count <= 9 ? 'grid-cols-4 sm:grid-cols-5'
        : 'grid-cols-5 sm:grid-cols-7'

export const makeEmit = (p: GameModeProps) => (name: string, ...args: any[]) => {
  if (name === 'answer') p.onAnswer?.(args[0])
  else if (name === 'play') p.onPlay?.(args[0])
  else if (name === 'ready') p.onReady?.()
}
