export const ChordDefinitions = {
  // Level 1 Chords
  DOMISO: { 
    id: 'domiso', 
    name: 'ドミソ', 
    symbol: 'C', 
    colorName: '赤', 
    color: '#EF4444', 
    notes: ['C4', 'E4', 'G4'], 
    abc: '[CEG]' 
  },
  DOFARA: { 
    id: 'dofara', 
    name: 'ドファラ', 
    symbol: 'F/C', 
    colorName: '黄', 
    color: '#FACC15', 
    notes: ['C4', 'F4', 'A4'], 
    abc: '[CFA]' 
  },
  SHIRESO: { 
    id: 'shireso', 
    name: 'シレソ', 
    symbol: 'G/B', 
    colorName: '青', 
    color: '#3B82F6', 
    notes: ['B3', 'D4', 'G4'], 
    abc: '[B,DG]' 
  },

  // Level 2 Chords
  RESOSHI: { 
    id: 'resoshi', 
    name: 'レソシ', 
    symbol: 'G/D', 
    colorName: '緑', 
    color: '#22C55E', 
    notes: ['D4', 'G4', 'B4'], 
    abc: '[DGB]' 
  },
  MISODO: { 
    id: 'misodo', 
    name: 'ミソド', 
    symbol: 'C/E', 
    colorName: 'オレンジ', 
    color: '#F97316', 
    notes: ['E4', 'G4', 'C5'], 
    abc: '[EGc]' 
  },
  RADOFA: { 
    id: 'radofa', 
    name: 'ラドファ', 
    symbol: 'F/A', 
    colorName: '紫', 
    color: '#A855F7', 
    notes: ['A3', 'C4', 'F4'], 
    abc: '[A,CF]' 
  },
  SOSHIRE: { 
    id: 'soshire', 
    name: 'ソシレ', 
    symbol: 'G', 
    colorName: 'ピンク', 
    color: '#EC4899', 
    notes: ['G4', 'B4', 'D5'], 
    abc: '[GBd]' 
  },
  SODOMI: { 
    id: 'sodomi', 
    name: 'ソドミ', 
    symbol: 'C/G', 
    colorName: '茶', 
    color: '#A3744D', 
    notes: ['G3', 'C4', 'E4'], 
    abc: '[G,CE]' 
  },

  // Level 3 Chords
  RADOSHARPMI: { 
    id: 'radosharpmi', 
    name: 'ラド#ミ', 
    symbol: 'A', 
    colorName: '黄緑', 
    color: '#84CC16', 
    notes: ['A3', 'C#4', 'E4'], 
    abc: '[A,^CE]' 
  },
  REFASHARPARA: { 
    id: 'refasharpara', 
    name: 'レファ#ラ', 
    symbol: 'D', 
    colorName: '肌色', 
    color: '#F4A460', 
    notes: ['D4', 'F#4', 'A4'], 
    abc: '[D^FA]' 
  },
  MISOSHARPSHI: { 
    id: 'misosharpshi', 
    name: 'ミソ#シ', 
    symbol: 'E', 
    colorName: '薄紫', 
    color: '#DDA0DD', 
    notes: ['E4', 'G#4', 'B4'], 
    abc: '[E^GB]' 
  },
  SHIFLATREFA: { 
    id: 'shiflatrefa', 
    name: 'シ♭レファ', 
    symbol: 'B♭', 
    colorName: '灰色', 
    color: '#6B7280', 
    notes: ['Bb3', 'D4', 'F4'], 
    abc: '[_B,DF]' 
  },
  MIFLATSHIBLAT: { 
    id: 'miflatshiblat', 
    name: 'ミ♭ソシ♭', 
    symbol: 'E♭', 
    colorName: '水色', 
    color: '#06B6D4', 
    notes: ['Eb4', 'G4', 'Bb4'], 
    abc: '[_EG_B]' 
  }
}

export const Levels = [
  {
    name: 'Level 1: 基本の3和音（赤・黄・青）',
    description: 'まずはここから。絶対音感トレーニングの基本となる3つの和音。',
    chords: [
      ChordDefinitions.DOMISO,
      ChordDefinitions.DOFARA,
      ChordDefinitions.SHIRESO
    ]
  },
  {
    name: 'Level 2: 白鍵の展開形',
    description: '基本の和音を展開した形。構成音が変わり、響きの色も変化します。',
    chords: [
      ChordDefinitions.RESOSHI,
      ChordDefinitions.MISODO,
      ChordDefinitions.RADOFA,
      ChordDefinitions.SOSHIRE,
      ChordDefinitions.SODOMI
    ]
  },
  {
    name: 'Level 3: 黒鍵を含む和音',
    description: 'シャープやフラットを含む、より複雑な色の響き。',
    chords: [
      ChordDefinitions.RADOSHARPMI,
      ChordDefinitions.REFASHARPARA,
      ChordDefinitions.MISOSHARPSHI,
      ChordDefinitions.SHIFLATREFA,
      ChordDefinitions.MIFLATSHIBLAT
    ]
  }
]
