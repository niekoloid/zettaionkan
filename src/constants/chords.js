export const ChordDefinitions = {
  // --- 白鍵の9個の和音 ---
  // ① 赤
  DOMISO: { 
    id: 'domiso', 
    name: 'ドミソ', 
    symbol: 'C', 
    colorName: 'あか', 
    color: '#EF4444', 
    notes: ['C4', 'E4', 'G4'], 
    abc: '[CEG]' 
  },
  // ② 黄色
  DOFARA: { 
    id: 'dofara', 
    name: 'ドファラ', 
    symbol: 'F/C', 
    colorName: 'きいろ', 
    color: '#FFFF00', 
    notes: ['C4', 'F4', 'A4'], 
    abc: '[CFA]' 
  },
  // ③ 青
  SHIRESO: { 
    id: 'shireso', 
    name: 'シレソ', 
    symbol: 'G/B', 
    colorName: 'あお', 
    color: '#3B82F6', 
    notes: ['B3', 'D4', 'G4'], 
    abc: '[B,DG]' 
  },
  // ④ 黒
  RADOFA: { 
    id: 'radofa', 
    name: 'ラドファ', 
    symbol: 'F/A', 
    colorName: 'くろ', 
    color: '#000000', 
    notes: ['A3', 'C4', 'F4'], 
    abc: '[A,CF]' 
  },
  // ⑤ 緑
  RESOSHI: { 
    id: 'resoshi', 
    name: 'レソシ', 
    symbol: 'G/D', 
    colorName: 'みどり', 
    color: '#22C55E', 
    notes: ['D4', 'G4', 'B4'], 
    abc: '[DGB]' 
  },
  // ⑥ オレンジ
  MISODO: { 
    id: 'misodo', 
    name: 'ミソド', 
    symbol: 'C/E', 
    colorName: 'おれんじ', 
    color: '#F97316', 
    notes: ['E4', 'G4', 'C5'], 
    abc: '[EGc]' 
  },
  // ⑦ 紫
  FARADO: { 
    id: 'farado', 
    name: 'ファラド', 
    symbol: 'F', 
    colorName: 'むらさき', 
    color: '#A855F7', 
    notes: ['F4', 'A4', 'C5'], 
    abc: '[FAc]' 
  },
  // ⑧ ピンク
  SOSHIRE: { 
    id: 'soshire', 
    name: 'ソシレ', 
    symbol: 'G', 
    colorName: 'ぴんく', 
    color: '#EC4899', 
    notes: ['G4', 'B4', 'D5'], 
    abc: '[GBd]' 
  },
  // ⑨ 茶色
  SODOMI: { 
    id: 'sodomi', 
    name: 'ソドミ', 
    symbol: 'C/G', 
    colorName: 'ちゃいろ', 
    color: '#A3744D', 
    notes: ['G3', 'C4', 'E4'], 
    abc: '[G,CE]' 
  },

  // --- 黒鍵の5個の和音 ---
  // ❶ 黄緑
  LA_CIS_MI: { 
    id: 'lacismi', 
    name: 'ラ<u>チス</u>ミ', 
    symbol: 'A', 
    colorName: 'きみどり', 
    color: '#84CC16', 
    notes: ['A3', 'C#4', 'E4'], 
    abc: '[A,^CE]' 
  },
  // ❷ 薄橙
  RE_FIS_LA: { 
    id: 'refisla', 
    name: 'レ<u>フィス</u>ラ', 
    symbol: 'D', 
    colorName: 'うすだいだい', 
    color: '#FFCC99', 
    notes: ['D4', 'F#4', 'A4'], 
    abc: '[D^FA]' 
  },
  // ❸ 藤色
  MI_GIS_SI: { 
    id: 'migissi', 
    name: 'ミ<u>ギス</u>シ', 
    symbol: 'E', 
    colorName: 'ふじいろ', 
    color: '#AF8AF2', 
    notes: ['E4', 'G#4', 'B4'], 
    abc: '[E^GB]' 
  },
  // ❹ 灰色
  BE_RE_FA: { 
    id: 'berefa', 
    name: '<u>ベー</u>レファ', 
    symbol: 'B♭', 
    colorName: 'はいいろ', 
    color: '#6B7280', 
    notes: ['Bb3', 'D4', 'F4'], 
    abc: '[_B,DF]' 
  },
  // ❺ 水色
  ES_SO_BE: { 
    id: 'essobe', 
    name: '<u>エス</u>ソ<u>ベー</u>', 
    symbol: 'E♭', 
    colorName: 'みずいろ', 
    color: '#06B6D4', 
    notes: ['Eb4', 'G4', 'Bb4'], 
    abc: '[_EG_B]' 
  }
}

export const Levels = [
  {
    name: 'Level 1: 基本の3和音',
    description: '赤・黄・青の基本となる3つの和音です。',
    chords: [
      ChordDefinitions.DOMISO,
      ChordDefinitions.DOFARA,
      ChordDefinitions.SHIRESO
    ]
  },
  {
    name: 'Level 2: 白鍵の和音(1)',
    description: '黒・緑・オレンジの3つの和音を追加します。',
    chords: [
      ChordDefinitions.RADOFA,
      ChordDefinitions.RESOSHI,
      ChordDefinitions.MISODO
    ]
  },
  {
    name: 'Level 3: 白鍵の和音(2)',
    description: '紫・ピンク・茶色の3つの和音を追加します。',
    chords: [
      ChordDefinitions.FARADO,
      ChordDefinitions.SOSHIRE,
      ChordDefinitions.SODOMI
    ]
  },
  {
    name: 'Level 4: 黒鍵を含む和音',
    description: '黄緑・薄橙・藤色・灰色・水色の5つの和音。より複雑な響きを学びます。',
    chords: [
      ChordDefinitions.LA_CIS_MI,
      ChordDefinitions.RE_FIS_LA,
      ChordDefinitions.MI_GIS_SI,
      ChordDefinitions.BE_RE_FA,
      ChordDefinitions.ES_SO_BE
    ]
  }
]
