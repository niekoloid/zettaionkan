/**
 * The 14 chords, in the order they are added: 9 white-key chords, then 5 with black keys.
 * `notes` are sample file names under /samples/steinway/s7/ (flats, no sharps).
 */
export interface Chord {
  id: string
  /** Note names for the parent, e.g. ドミソ */
  notes: string
  /** What the child says, in hiragana */
  kana: string
  /** Narration file under /narration/google/ */
  narration: string
  color: string
  /** Text colour that reads on top of `color` */
  ink: string
  samples: string[]
}

export const CHORDS: Chord[] = [
  { id: 'domiso', notes: 'ドミソ', kana: 'あか', narration: '赤', color: '#E53935', ink: '#fff', samples: ['C4', 'E4', 'G4'] },
  { id: 'dofara', notes: 'ドファラ', kana: 'きいろ', narration: '黄色', color: '#FDD835', ink: '#3E2723', samples: ['C4', 'F4', 'A4'] },
  { id: 'shireso', notes: 'シレソ', kana: 'あお', narration: '青', color: '#1E40AF', ink: '#fff', samples: ['B3', 'D4', 'G4'] },
  { id: 'radofa', notes: 'ラドファ', kana: 'くろ', narration: '黒', color: '#111827', ink: '#fff', samples: ['A3', 'C4', 'F4'] },
  { id: 'resoshi', notes: 'レソシ', kana: 'みどり', narration: '緑', color: '#16A34A', ink: '#fff', samples: ['D4', 'G4', 'B4'] },
  { id: 'misodo', notes: 'ミソド', kana: 'オレンジ', narration: 'オレンジ', color: '#F97316', ink: '#fff', samples: ['E4', 'G4', 'C5'] },
  { id: 'farado', notes: 'ファラド', kana: 'むらさき', narration: '紫', color: '#7E22CE', ink: '#fff', samples: ['F4', 'A4', 'C5'] },
  { id: 'soshire', notes: 'ソシレ', kana: 'ピンク', narration: 'ピンク', color: '#F472B6', ink: '#fff', samples: ['G4', 'B4', 'D5'] },
  { id: 'sodomi', notes: 'ソドミ', kana: 'ちゃいろ', narration: '茶色', color: '#78350F', ink: '#fff', samples: ['G4', 'C5', 'E5'] },
  { id: 'ladosmi', notes: 'ラド♯ミ', kana: 'きみどり', narration: '黄緑', color: '#84CC16', ink: '#1A2E05', samples: ['A3', 'Db4', 'E4'] },
  { id: 'refasla', notes: 'レファ♯ラ', kana: 'ベージュ', narration: 'ベージュ', color: '#E7D3AE', ink: '#3E2723', samples: ['D4', 'Gb4', 'A4'] },
  { id: 'misossi', notes: 'ミソ♯シ', kana: 'うすむらさき', narration: '薄紫', color: '#C4B5FD', ink: '#2E1065', samples: ['E4', 'Ab4', 'B4'] },
  { id: 'sibrefa', notes: 'シ♭レファ', kana: 'グレー', narration: 'グレー', color: '#6B7280', ink: '#fff', samples: ['Bb3', 'D4', 'F4'] },
  { id: 'mibsosib', notes: 'ミ♭ソシ♭', kana: 'みずいろ', narration: '水色', color: '#38BDF8', ink: '#082F49', samples: ['Eb4', 'G4', 'Bb4'] }
]

export const CHORD_BY_ID: Record<string, Chord> = Object.fromEntries(CHORDS.map(c => [c.id, c]))

/** Chords the child is working on at a given level (level = number of chords) */
export const chordsForLevel = (level: number) => CHORDS.slice(0, Math.max(1, Math.min(level, CHORDS.length)))

export const ALL_SAMPLES = Array.from(new Set(CHORDS.flatMap(c => c.samples)))
