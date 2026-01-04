
import { ChordDefinitions } from './chords'

export const SONGS = [
  {
    id: 'twinkle',
    title: 'きらきら星',
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
