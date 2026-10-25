
import { ChordDefinitions, type Chord } from './chords'

export interface SongSequenceItem {
  chord?: Chord | null
  notes?: string[]
  duration: string
}

export interface Song {
  id: string
  title: string
  bpm: number
  sequence: SongSequenceItem[]
}

export const SONGS: Song[] = [
  {
    id: 'twinkle_mozart',
    title: 'きらきら星変奏曲 (モーツァルト)',
    bpm: 100,
    sequence: [
      // AH! VOUS DIRAI-JE, MAMAN (Theme)
      // M1-2: C C
      { notes: ['C4', 'C3'], duration: '4n' },
      { notes: ['C4', 'E3', 'G3'], duration: '4n' },
      // M3-4: G G
      { notes: ['G4', 'G3'], duration: '4n' },
      { notes: ['G4', 'B3', 'D4'], duration: '4n' },
      // M5-6: A A
      { notes: ['A4', 'F3'], duration: '4n' },
      { notes: ['A4', 'A3', 'C4'], duration: '4n' },
      // M7-8: G
      { notes: ['G4', 'E3', 'G3'], duration: '2n' },

      // M9-10: F F
      { notes: ['F4', 'D3'], duration: '4n' },
      { notes: ['F4', 'F3', 'A3'], duration: '4n' },
      // M11-12: E E
      { notes: ['E4', 'C3'], duration: '4n' },
      { notes: ['E4', 'E3', 'G3'], duration: '4n' },
      // M13-14: D D
      { notes: ['D4', 'G2'], duration: '4n' },
      { notes: ['D4', 'B2', 'D3'], duration: '4n' },
      // M15-16: C
      { notes: ['C4', 'C3', 'E3', 'G3'], duration: '2n' },

      // Middle section
      // M17-18: G G
      { notes: ['G4', 'G3', 'B3', 'D4'], duration: '4n' },
      { notes: ['G4', 'G3', 'B3', 'D4'], duration: '4n' },
      // M19-20: F F
      { notes: ['F4', 'F3', 'A3', 'C4'], duration: '4n' },
      { notes: ['F4', 'F3', 'A3', 'C4'], duration: '4n' },
      // M21-22: E E
      { notes: ['E4', 'E3', 'G3', 'C4'], duration: '4n' },
      { notes: ['E4', 'E3', 'G3', 'C4'], duration: '4n' },
      // M23-24: D
      { notes: ['D4', 'D3', 'F3', 'B3'], duration: '2n' },

      // Variation 1 - Right hand running notes
      { notes: ['C3'], duration: '4n' }, // LH anchor
      { notes: ['C4'], duration: '16n' },
      { notes: ['D4'], duration: '16n' },
      { notes: ['E4'], duration: '16n' },
      { notes: ['F4'], duration: '16n' },
      { notes: ['G4', 'E3'], duration: '16n' },
      { notes: ['F4'], duration: '16n' },
      { notes: ['E4'], duration: '16n' },
      { notes: ['D4'], duration: '16n' },
      { notes: ['E4', 'G3'], duration: '16n' },
      { notes: ['F4'], duration: '16n' },
      { notes: ['G4'], duration: '16n' },
      { notes: ['A4'], duration: '16n' },
      { notes: ['B4', 'F3'], duration: '16n' },
      { notes: ['A4'], duration: '16n' },
      { notes: ['G4'], duration: '16n' },
      { notes: ['F4'], duration: '16n' },
      { notes: ['G4', 'E3'], duration: '16n' },
      { notes: ['A4'], duration: '16n' },
      { notes: ['B4'], duration: '16n' },
      { notes: ['C5'], duration: '16n' },
      { notes: ['D5', 'G2'], duration: '16n' },
      { notes: ['C5'], duration: '16n' },
      { notes: ['B4'], duration: '16n' },
      { notes: ['A4'], duration: '16n' },
      { notes: ['G4', 'C3'], duration: '2n' }
    ]
  },
  {
    id: 'twinkle',
    title: 'きらきら星 (和音版)',
    bpm: 80,
    sequence: [
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.LA_CIS_MI, duration: '4n' }, 
      { chord: ChordDefinitions.LA_CIS_MI, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' },

      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  },
  {
    id: 'frog',
    title: 'かえるの歌',
    bpm: 100,
    sequence: [
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: null, duration: '4n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.LA_CIS_MI, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: null, duration: '4n' }
    ]
  },
  {
    id: 'merrylamb',
    title: 'メリーさんのひつじ',
    bpm: 90,
    sequence: [
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },

      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '2n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },

      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  },
  {
    id: 'butterfly',
    title: 'ちょうちょう',
    bpm: 85,
    sequence: [
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '2n' },

      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' },

      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '2n' },

      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },
      { chord: null, duration: '4n' }
    ]
  },
  {
    id: 'bee',
    title: 'ぶんぶんぶん',
    bpm: 110,
    sequence: [
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' },
      { chord: null, duration: '4n' },

      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' },
      { chord: null, duration: '4n' },

      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '2n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' },

      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  },
  {
    id: 'london',
    title: 'ロンドン橋',
    bpm: 100,
    sequence: [
      { chord: ChordDefinitions.SOSHIRE, duration: '4n.' },
      { chord: ChordDefinitions.LA_CIS_MI, duration: '8n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },

      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '2n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.LA_CIS_MI, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' }
    ]
  },
  {
    id: 'jingle',
    title: 'ジングルベル',
    bpm: 120,
    sequence: [
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n.' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '8n' },
      { chord: ChordDefinitions.MISODO, duration: '2n' },

      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n.' },
      { chord: ChordDefinitions.FARADO, duration: '8n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '8n' },
      { chord: ChordDefinitions.MISODO, duration: '8n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '2n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' }
    ]
  },
  {
    id: 'donguri',
    title: 'どんぐりころころ',
    bpm: 105,
    sequence: [
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' },

      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '2n' },

      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  },
  {
    id: 'musunde',
    title: 'むすんでひらいて',
    bpm: 95,
    sequence: [
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' },

      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  },
  {
    id: 'oldclock',
    title: '大きな古時計',
    bpm: 75,
    sequence: [
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' },

      { chord: ChordDefinitions.MISODO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.RE_FIS_LA, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '1n' },

      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.FARADO, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '4n' },
      { chord: ChordDefinitions.SOSHIRE, duration: '4n' },
      { chord: ChordDefinitions.DOMISO, duration: '2n' }
    ]
  }
]
