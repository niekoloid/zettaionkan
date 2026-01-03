export const ChordDefinitions = {
  // --- 白鍵の9個の和音 ---
  DOMISO: { id: 'domiso', name: 'ドミソ', nameIt: 'ドミソ', symbol: 'C', colorName: '赤', color: '#EF4444', notes: ['C4', 'E4', 'G4'], abc: '[CEG]' },
  SHIRESO: { id: 'shireso', name: 'シレソ', nameIt: 'シレソ', symbol: 'G/B', colorName: '青', color: '#3B82F6', notes: ['B3', 'D4', 'G4'], abc: '[B,DG]' },
  DOFARA: { id: 'dofara', name: 'ドファラ', nameIt: 'ドファラ', symbol: 'F/C', colorName: '黄色', color: '#FFFF00', notes: ['C4', 'F4', 'A4'], abc: '[CFA]' },
  RADOFA: { id: 'radofa', name: 'ラドファ', nameIt: 'ラドファ', symbol: 'F/A', colorName: '黒', color: '#000000', notes: ['A3', 'C4', 'F4'], abc: '[A,CF]' },
  RESOSHI: { id: 'resoshi', name: 'レソシ', nameIt: 'レソシ', symbol: 'G/D', colorName: '緑', color: '#22C55E', notes: ['D4', 'G4', 'B4'], abc: '[DGB]' },
  MISODO: { id: 'misodo', name: 'ミソド', nameIt: 'ミソド', symbol: 'C/E', colorName: 'オレンジ', color: '#F97316', notes: ['E4', 'G4', 'C5'], abc: '[EGc]' },
  FARADO: { id: 'farado', name: 'ファラド', nameIt: 'ファラド', symbol: 'F', colorName: '紫', color: '#A855F7', notes: ['F4', 'A4', 'C5'], abc: '[FAc]' },
  SOSHIRE: { id: 'soshire', name: 'ソシレ', nameIt: 'ソシレ', symbol: 'G', colorName: 'ピンク', color: '#EC4899', notes: ['G4', 'B4', 'D5'], abc: '[GBd]' },
  SODOMI: { id: 'sodomi', name: 'ソドミ', nameIt: 'ソドミ', symbol: 'C/G', colorName: '茶色', color: '#A3744D', notes: ['G4', 'C5', 'E5'], abc: '[Gce]' },

  // --- 黒鍵の和音：基本形 ---
  LA_CIS_MI: { id: 'lacismi', name: 'ラ<u>チス</u>ミ', nameIt: 'ラド♯ミ', symbol: 'A', colorName: '黄緑', color: '#84CC16', notes: ['A3', 'C#4', 'E4'], abc: '[A,^CE]' },
  RE_FIS_LA: { id: 'refisla', name: 'レ<u>フィス</u>ラ', nameIt: 'レファ♯ラ', symbol: 'D', colorName: '肌色', color: '#FFCC99', notes: ['D4', 'F#4', 'A4'], abc: '[D^FA]' },
  MI_GIS_SI: { id: 'migissi', name: 'ミ<u>ギス</u>シ', nameIt: 'ミソ♯シ', symbol: 'E', colorName: '藤色', color: '#AF8AF2', notes: ['E4', 'G#4', 'B4'], abc: '[E^GB]' },
  BE_RE_FA: { id: 'berefa', name: '<u>ベー</u>レファ', nameIt: 'シ♭レファ', symbol: 'B♭', colorName: '灰色', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'], abc: '[_B,DF]' },
  ES_SO_BE: { id: 'essobe', name: '<u>エス</u>ソ<u>ベー</u>', nameIt: 'ミ♭ソシ♭', symbol: 'E♭', colorName: '水色', color: '#06B6D4', notes: ['Eb4', 'G4', 'Bb4'], abc: '[_EG_B]' },

  // --- 黒鍵の和音：第1転回形 ---
  CIS_MI_LA: { id: 'cismila', name: '<u>チス</u>ミラ', nameIt: 'ド♯ミラ', symbol: 'A/C#', colorName: '黄緑', color: '#84CC16', notes: ['C#4', 'E4', 'A4'], abc: '[^CEA]' },
  FIS_LA_RE: { id: 'fislare', name: '<u>フィス</u>ラレ', nameIt: 'ファ♯ラレ', symbol: 'D/F#', colorName: '肌色', color: '#FFCC99', notes: ['F#4', 'A4', 'D5'], abc: '[^FAd]' },
  GIS_SI_MI: { id: 'gissimi', name: '<u>ギス</u>シミ', nameIt: 'ソ♯シミ', symbol: 'E/G#', colorName: '藤色', color: '#AF8AF2', notes: ['G#4', 'B4', 'E5'], abc: '[^GBe]' },
  RE_FA_BE: { id: 'refabe', name: 'レファ<u>ベー</u>', nameIt: 'レファシ♭', symbol: 'B♭/D', colorName: '灰色', color: '#6B7280', notes: ['D4', 'F4', 'Bb4'], abc: '[DF_B]' },
  SO_BE_ES: { id: 'sobees', name: 'ソ<u>ベー</u><u>エス</u>', nameIt: 'ソシ♭ミ♭', symbol: 'E♭/G', colorName: '水色', color: '#06B6D4', notes: ['G4', 'Bb4', 'Eb5'], abc: '[G_B_e]' },

  // --- 黒鍵の和音：第2転回形 ---
  MI_LA_CIS: { id: 'milacis', name: 'ミラ<u>チス</u>', nameIt: 'ミラド♯', symbol: 'A/E', colorName: '黄緑', color: '#84CC16', notes: ['E4', 'A4', 'C#5'], abc: '[EA^c]' },
  LA_RE_FIS: { id: 'larefis', name: 'ラレ<u>フィス</u>', nameIt: 'ラレファ♯', symbol: 'D/A', colorName: '肌色', color: '#FFCC99', notes: ['A3', 'D4', 'F#4'], abc: '[A,D^F]' },
  SI_MI_GIS: { id: 'simigis', name: 'シミ<u>ギス</u>', nameIt: 'シミソ♯', symbol: 'E/B', colorName: '藤色', color: '#AF8AF2', notes: ['B3', 'E4', 'G#4'], abc: '[B,E^G]' },
  FA_BE_RE: { id: 'fabere', name: 'ファ<u>ベー</u>レ', nameIt: 'ファシ♭レ', symbol: 'B♭/F', colorName: '灰色', color: '#6B7280', notes: ['F4', 'Bb4', 'D5'], abc: '[F_Bd]' },
  BE_ES_SO: { id: 'beesso', name: '<u>ベー</u><u>エス</u>ソ', nameIt: 'シ♭ミ♭ソ', symbol: 'E♭/B♭', colorName: '水色', color: '#06B6D4', notes: ['Bb3', 'Eb4', 'G4'], abc: '[_B,_EG]' }
}

export const Levels = [
  {
    name: 'STEP 1: はじまりの3和音',
    shortName: 'STEP 1',
    description: '赤・青・黄色の基本となる3つの和音です。',
    chords: [ChordDefinitions.DOMISO, ChordDefinitions.DOFARA, ChordDefinitions.SHIRESO]
  },
  {
    name: 'STEP 2: 白鍵のハーモニー',
    shortName: 'STEP 2',
    description: '白鍵のすべての和音（6個）を習得しましょう。',
    chords: [ChordDefinitions.RADOFA, ChordDefinitions.RESOSHI, ChordDefinitions.MISODO, ChordDefinitions.FARADO, ChordDefinitions.SOSHIRE, ChordDefinitions.SODOMI]
  },
  {
    name: 'STEP 3: 黒鍵の彩り',
    shortName: 'STEP 3',
    description: '黒鍵を含む5つの和音を学び、色の世界を広げます。',
    chords: [ChordDefinitions.LA_CIS_MI, ChordDefinitions.RE_FIS_LA, ChordDefinitions.MI_GIS_SI, ChordDefinitions.BE_RE_FA, ChordDefinitions.ES_SO_BE]
  },
  {
    name: 'STEP 4: 黒鍵の響き（転回形 I）',
    shortName: 'STEP 4',
    description: '黒鍵を含む和音の第1転回形を学びます。',
    chords: [ChordDefinitions.CIS_MI_LA, ChordDefinitions.FIS_LA_RE, ChordDefinitions.GIS_SI_MI, ChordDefinitions.RE_FA_BE, ChordDefinitions.SO_BE_ES]
  },
  {
    name: 'STEP 5: 黒鍵の響き（転回形 II）',
    shortName: 'STEP 5',
    description: '黒鍵を含む和音の第2転回形を学びます。',
    chords: [ChordDefinitions.MI_LA_CIS, ChordDefinitions.LA_RE_FIS, ChordDefinitions.SI_MI_GIS, ChordDefinitions.FA_BE_RE, ChordDefinitions.BE_ES_SO]
  }
]
