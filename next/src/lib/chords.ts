import { ChordDefinitions, type Chord } from '@/constants/chords'

export const CHORD_MAPPINGS_COOKIE = 'zettaionkan_custom_chords'

export interface ChordOverride {
  color: string
  colorName: string
  homeEnabled?: boolean
}

export type CustomMappings = Record<string, ChordOverride>

export type EffectiveChord = Chord & { homeEnabled: boolean }

const PRIMARY_CHORD_IDS = [
  'domiso', 'dofara', 'shireso', 'radofa', 'resoshi',
  'misodo', 'farado', 'soshire', 'sodomi',
  'lacismi', 'refisla', 'migissi', 'berefa', 'essobe'
]

const INVERSION_MAP: Record<string, string> = {
  cismila: 'lacismi', milacis: 'lacismi',
  fislare: 'refisla', larefis: 'refisla',
  gissimi: 'migissi', simigis: 'migissi',
  refabe: 'berefa', fabere: 'berefa',
  sobees: 'essobe', beesso: 'essobe'
}

const findBase = (id: string) => Object.values(ChordDefinitions).find(c => c.id === id)

export function getEffectiveChord(mappings: CustomMappings, id: string): EffectiveChord | null {
  const base = findBase(id)
  if (!base) return null
  const override = mappings[INVERSION_MAP[id] || id]
  return {
    ...base,
    color: override?.color || base.color,
    colorName: override?.colorName || base.colorName,
    displayColor: override?.colorName || base.colorName,
    homeEnabled: override?.homeEnabled ?? false
  }
}

export function buildAllChords(mappings: CustomMappings): EffectiveChord[] {
  return PRIMARY_CHORD_IDS.flatMap(id => {
    const base = findBase(id)
    if (!base) return []
    const override = mappings[id]
    return [{
      ...base,
      color: override?.color || base.color,
      colorName: override?.colorName || base.colorName,
      homeEnabled: override?.homeEnabled ?? false
    }]
  })
}

/** Light backgrounds need dark text. */
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 180
}
