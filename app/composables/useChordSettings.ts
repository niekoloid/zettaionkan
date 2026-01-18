import { computed } from 'vue'
import { ChordDefinitions, type Chord } from '~/constants/chords'

const STORAGE_KEY = 'zettaionkan_custom_chords'

interface ChordOverride {
  color: string
  colorName: string
  homeEnabled?: boolean
}

type CustomMappings = Record<string, ChordOverride>

const PRIMARY_CHORD_IDS = [
  'domiso', 'dofara', 'shireso', 'radofa', 'resoshi', 
  'misodo', 'farado', 'soshire', 'sodomi',
  'lacismi', 'refisla', 'migissi', 'berefa', 'essobe'
]

const INVERSION_MAP: Record<string, string> = {
  'cismila': 'lacismi',
  'milacis': 'lacismi',
  'fislare': 'refisla',
  'larefis': 'refisla',
  'gissimi': 'migissi',
  'simigis': 'migissi',
  'refabe': 'berefa',
  'fabere': 'berefa',
  'sobees': 'essobe',
  'beesso': 'essobe'
}

export function useChordSettings() {
  // Use Cookie for mappings to ensure colors are correct on first SSR hit
  const customMappings = useCookie<CustomMappings>(STORAGE_KEY, {
    default: () => ({}),
    watch: true,
    maxAge: 60 * 60 * 24 * 365 * 100 // 100 years
  })

  // Removed all DB sync/save logic. Mappings are now purely local (Cookies).

  const getEffectiveChord = (id: string): (Chord & { homeEnabled: boolean }) | null => {
    const base = Object.values(ChordDefinitions).find(c => c.id === id)
    if (!base) return null
    
    const primaryId = INVERSION_MAP[id] || id
    const override = (customMappings.value as CustomMappings)[primaryId]
    
    return {
      ...base,
      color: override?.color || base.color,
      colorName: override?.colorName || base.colorName,
      displayColor: override?.colorName || base.colorName,
      homeEnabled: override?.homeEnabled !== undefined ? override.homeEnabled : false
    }
  }

  const allChords = computed<(Chord & { homeEnabled: boolean })[]>(() => {
    return PRIMARY_CHORD_IDS.map(id => {
      const base = Object.values(ChordDefinitions).find(c => c.id === id)
      if (!base) return null
      
      const override = (customMappings.value as CustomMappings)[id]
      return {
        ...base,
        color: override?.color || base.color,
        colorName: override?.colorName || base.colorName,
        homeEnabled: override?.homeEnabled !== undefined ? override.homeEnabled : false
      }
    }).filter((c): c is (Chord & { homeEnabled: boolean }) => Boolean(c))
  })

  const saveSingleMapping = async (id: string, mapping: ChordOverride) => {
    // Simply update the cookie-backed ref
    const updated = { ...customMappings.value }
    updated[id] = { 
      color: mapping.color,
      colorName: mapping.colorName,
      homeEnabled: mapping.homeEnabled
    }
    customMappings.value = updated
  }

  const resetAll = async () => {
    if (!confirm('本当に全ての設定をリセットしますか？')) return
    customMappings.value = {}
  }

  return {
    allChords,
    getEffectiveChord,
    saveSingleMapping,
    resetAll
  }
}
