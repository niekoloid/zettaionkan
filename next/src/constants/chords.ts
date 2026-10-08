export interface Chord {
  id: string
  name: string
  nameIt: string
  symbol: string
  colorName: string
  color: string
  notes: string[]
  abc: string
  scoreImage?: string
  // Runtime properties
  displayColor?: string
  displayColorFormatted?: string
  label?: string
  globalIndex?: number
  sortOrder?: number
  isLight?: boolean
}

export const ChordDefinitions: Record<string, Chord> = {
  // --- 白鍵の9個の和音 ---
  DOMISO: { id: 'domiso', name: 'ドミソ', nameIt: 'ドミソ', symbol: 'C', colorName: '赤', color: '#EF4444', notes: ['C4', 'E4', 'G4'], abc: '[CEG]', scoreImage: '/videos/assets/scores/Lv1_score_赤.png', sortOrder: 1 },
  DOFARA: { id: 'dofara', name: 'ドファラ', nameIt: 'ドファラ', symbol: 'F/C', colorName: '黄色', color: '#FFD700', notes: ['C4', 'F4', 'A4'], abc: '[CFA]', scoreImage: '/videos/assets/scores/Lv2_score_黄色.png', sortOrder: 2 },
  SHIRESO: { id: 'shireso', name: 'シレソ', nameIt: 'シレソ', symbol: 'G/B', colorName: '青', color: '#0000FF', notes: ['B3', 'D4', 'G4'], abc: '[B,DG]', scoreImage: '/videos/assets/scores/Lv3_score_青.png', sortOrder: 3 },
  RADOFA: { id: 'radofa', name: 'ラドファ', nameIt: 'ラドファ', symbol: 'F/A', colorName: '黒', color: '#000000', notes: ['A3', 'C4', 'F4'], abc: '[A,CF]', scoreImage: '/videos/assets/scores/Lv4_score_黒.png', sortOrder: 4 },
  RESOSHI: { id: 'resoshi', name: 'レソシ', nameIt: 'レソシ', symbol: 'G/D', colorName: '緑', color: '#16a34a', notes: ['D4', 'G4', 'B4'], abc: '[DGB]', scoreImage: '/videos/assets/scores/Lv5_score_緑.png', sortOrder: 5 },
  MISODO: { id: 'misodo', name: 'ミソド', nameIt: 'ミソド', symbol: 'C/E', colorName: 'オレンジ', color: '#F97316', notes: ['E4', 'G4', 'C5'], abc: '[EGc]', scoreImage: '/videos/assets/scores/Lv6_score_オレンジ.png', sortOrder: 6 },
  FARADO: { id: 'farado', name: 'ファラド', nameIt: 'ファラド', symbol: 'F', colorName: '紫', color: '#9333ea', notes: ['F4', 'A4', 'C5'], abc: '[FAc]', scoreImage: '/videos/assets/scores/Lv7_score_紫.png', sortOrder: 7 },
  SOSHIRE: { id: 'soshire', name: 'ソシレ', nameIt: 'ソシレ', symbol: 'G', colorName: 'ピンク', color: '#fbcfe8', notes: ['G4', 'B4', 'D5'], abc: '[GBd]', scoreImage: '/videos/assets/scores/Lv8_score_ピンク.png', sortOrder: 8 },
  SODOMI: { id: 'sodomi', name: 'ソドミ', nameIt: 'ソドミ', symbol: 'C/G', colorName: '茶色', color: '#713F12', notes: ['G4', 'C5', 'E5'], abc: '[Gce]', scoreImage: '/videos/assets/scores/Lv9_score_茶色.png', sortOrder: 9 },

  // --- 黒鍵の和音：基本形 ---
  LA_CIS_MI: { id: 'lacismi', name: 'ラ<u>チス</u>ミ', nameIt: 'ラド♯ミ', symbol: 'A', colorName: '黄緑', color: '#84cc16', notes: ['A3', 'C#4', 'E4'], abc: '[A,^CE]', scoreImage: '/videos/assets/scores/Lv10_score_黄緑.png', sortOrder: 10 },
  RE_FIS_LA: { id: 'refisla', name: 'レ<u>フィス</u>ラ', nameIt: 'レファ♯ラ', symbol: 'D', colorName: 'ベージュ', color: '#F5DEB3', notes: ['D4', 'F#4', 'A4'], abc: '[D^FA]', scoreImage: '/videos/assets/scores/Lv11_score_ベージュ.png', sortOrder: 11 },
  MI_GIS_SI: { id: 'migissi', name: 'ミ<u>ギス</u>シ', nameIt: 'ミソ♯シ', symbol: 'E', colorName: '薄紫', color: '#c4b5fd', notes: ['E4', 'G#4', 'B4'], abc: '[E^GB]', scoreImage: '/videos/assets/scores/Lv12_score_薄紫.png', sortOrder: 12 },
  BE_RE_FA: { id: 'berefa', name: '<u>ベー</u>レファ', nameIt: 'シ♭レファ', symbol: 'B♭', colorName: 'グレー', color: '#6B7280', notes: ['Bb3', 'D4', 'F4'], abc: '[_B,DF]', scoreImage: '/videos/assets/scores/Lv13_score_グレー.png', sortOrder: 13 },
  ES_SO_BE: { id: 'essobe', name: '<u>エス</u>ソ<u>ベー</u>', nameIt: 'ミ♭ソシ♭', symbol: 'E♭', colorName: '水色', color: '#7FDBFF', notes: ['Eb4', 'G4', 'Bb4'], abc: '[_EG_B]', scoreImage: '/videos/assets/scores/Lv14_score_水色.png', sortOrder: 14 },

  // --- 黒鍵の和音：第1転回形 ---
  CIS_MI_LA: { id: 'cismila', name: '<u>チス</u>ミラ', nameIt: 'ド♯ミラ', symbol: 'A/C#', colorName: '黄緑', color: '#84cc16', notes: ['C#4', 'E4', 'A4'], abc: '[^CEA]', sortOrder: 10 },
  FIS_LA_RE: { id: 'fislare', name: '<u>フィス</u>ラレ', nameIt: 'ファ♯ラレ', symbol: 'D/F#', colorName: 'ベージュ', color: '#F5DEB3', notes: ['F#4', 'A4', 'D5'], abc: '[^FAd]', sortOrder: 11 },
  GIS_SI_MI: { id: 'gissimi', name: '<u>ギス</u>シミ', nameIt: 'ソ♯シミ', symbol: 'E/G#', colorName: '薄紫', color: '#c4b5fd', notes: ['G#4', 'B4', 'E5'], abc: '[^GBe]', sortOrder: 12 },
  RE_FA_BE: { id: 'refabe', name: 'レファ<u>ベー</u>', nameIt: 'レファシ♭', symbol: 'B♭/D', colorName: 'グレー', color: '#6B7280', notes: ['D4', 'F4', 'Bb4'], abc: '[DF_B]', sortOrder: 13 },
  SO_BE_ES: { id: 'sobees', name: 'ソ<u>ベー</u><u>エス</u>', nameIt: 'ソシ♭ミ♭', symbol: 'E♭/G', colorName: '水色', color: '#06B6D4', notes: ['G4', 'Bb4', 'Eb5'], abc: '[G_B_e]', sortOrder: 14 },

  // --- 黒鍵の和音：第2転回形 ---
  MI_LA_CIS: { id: 'milacis', name: 'ミラ<u>チス</u>', nameIt: 'ミラド♯', symbol: 'A/E', colorName: '黄緑', color: '#84cc16', notes: ['E4', 'A4', 'C#5'], abc: '[EA^c]', sortOrder: 10 },
  LA_RE_FIS: { id: 'larefis', name: 'ラレ<u>フィス</u>', nameIt: 'ラレファ♯', symbol: 'D/A', colorName: 'ベージュ', color: '#F5DEB3', notes: ['A3', 'D4', 'F#4'], abc: '[A,D^F]', sortOrder: 11 },
  SI_MI_GIS: { id: 'simigis', name: 'シミ<u>ギス</u>', nameIt: 'シミソ♯', symbol: 'E/B', colorName: '薄紫', color: '#c4b5fd', notes: ['B3', 'E4', 'G#4'], abc: '[B,E^G]', sortOrder: 12 },
  FA_BE_RE: { id: 'fabere', name: 'ファ<u>ベー</u>レ', nameIt: 'ファシ♭レ', symbol: 'B♭/F', colorName: 'グレー', color: '#6B7280', notes: ['F4', 'Bb4', 'D5'], abc: '[F_Bd]', sortOrder: 13 },
  BE_ES_SO: { id: 'beesso', name: '<u>ベー</u><u>エス</u>ソ', nameIt: 'シ♭ミ♭ソ', symbol: 'E♭/B♭', colorName: '水色', color: '#06B6D4', notes: ['Bb3', 'Eb4', 'G4'], abc: '[_B,_EG]', sortOrder: 14 }
}
