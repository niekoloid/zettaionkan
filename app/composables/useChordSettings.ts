import { ref, computed } from 'vue'
import { ChordDefinitions, type Chord } from '~/constants/chords'
import type { Database } from '~/types/database.types'

const STORAGE_KEY = 'zettaionkan_custom_chords'

interface ChordOverride {
  color: string
  colorName: string
}

type CustomMappings = Record<string, ChordOverride>

// Global state to share across components - SINGLETON
// We can use refs outside for simple state
const customMappings = ref<CustomMappings>({})
const isSyncing = ref(false)
const isInitialized = ref(false)

// 1 INITIAL LOAD: LocalStorage (Fastest)
const loadLocal = () => {
  if (import.meta.server) return // Skip on server
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      customMappings.value = JSON.parse(saved)
      console.log('useChordSettings: Local settings loaded', customMappings.value)
    } catch (e) {
      console.error('Failed to parse custom chords mapping', e)
    }
  }
}
if (import.meta.client) loadLocal()

// 14 Primary Chord IDs for absolute pitch training
const PRIMARY_CHORD_IDS = [
  'domiso', 'dofara', 'shireso', 'radofa', 'resoshi', 
  'misodo', 'farado', 'soshire', 'sodomi',
  'lacismi', 'refisla', 'migissi', 'berefa', 'essobe'
]

// Mapping inversions to their root IDs to share settings
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
  const supabase = useSupabaseClient<Database>()
  
  // 2 SYNC WITH DB LOGIC (Async)
  const syncWithDb = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      console.log('useChordSettings: No user for DB sync')
      return
    }

    if (isSyncing.value) return
    isSyncing.value = true
    
    try {
      console.log('useChordSettings: Syncing with DB...')
      const { data, error } = await supabase
        .from('profiles')
        .select('custom_chords')
        .eq('id', user.id)
        .maybeSingle()
      
      const profileData = data as any
      
      if (error) throw error

      if (profileData?.custom_chords && typeof profileData.custom_chords === 'object') {
        // Safe cast as we assume JSON structure matches
        const dbChords = profileData.custom_chords as CustomMappings
        console.log('useChordSettings: DB settings found', dbChords)
        // Merge DB settings, DB takes priority
        const merged = { ...customMappings.value, ...dbChords }
        customMappings.value = merged
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      }
    } catch (e: any) {
      console.warn('useChordSettings: DB sync error', e.message)
    } finally {
      isSyncing.value = false
    }
  }

  const init = () => {
    if (isInitialized.value) return
    isInitialized.value = true

    // Initial sync
    syncWithDb()

    // 3 AUTO-SYNC ON AUTH CHANGES
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        syncWithDb()
      }
    })
  }

  // Initialize only on client
  if (import.meta.client) {
    init()
  }

  const saveToDb = async (newMappings: CustomMappings) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    try {
      console.log('useChordSettings: Saving to DB...', newMappings)
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          // DB expects Json type, simple object is compatible
          custom_chords: newMappings
        } as any)
      
      if (error) throw error
      console.log('useChordSettings: DB update successful')
    } catch (e) {
      console.error('useChordSettings: DB save error details:', e)
    }
  }

  const getEffectiveChord = (id: string): Chord | null => {
    // ChordDefinitions keys are strings, but we need to check if id exists
    const base = Object.values(ChordDefinitions).find(c => c.id === id)
    if (!base) return null
    
    // Check if this is an inversion and find its primary ID
    const primaryId = INVERSION_MAP[id] || id
    const override = customMappings.value[primaryId]
    
    return {
      ...base,
      color: override?.color || base.color,
      colorName: override?.colorName || base.colorName,
      displayColor: override?.colorName || base.colorName
    }
  }

  const allChords = computed<Chord[]>(() => {
    return PRIMARY_CHORD_IDS.map(id => {
      const base = Object.values(ChordDefinitions).find(c => c.id === id)
      if (!base) return null
      
      const override = customMappings.value[id]
      return {
        ...base,
        color: override?.color || base.color,
        colorName: override?.colorName || base.colorName
      }
    }).filter((c): c is Chord => Boolean(c))
  })

  const saveSingleMapping = async (id: string, mapping: ChordOverride) => {
    console.group(`useChordSettings: Saving ${id}`)
    console.log('New values:', mapping)
    
    try {
      // 1. Update Reactive State
      const updated = { ...customMappings.value }
      updated[id] = { 
        color: mapping.color,
        colorName: mapping.colorName 
      }
      customMappings.value = updated
      console.log('State updated')

      // 2. Persist LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      console.log('LocalStorage updated')

      // 3. Persist Remote
      await saveToDb(updated)
    } catch (e) {
      console.error('Save failed:', e)
    } finally {
      console.groupEnd()
    }
  }

  const resetAll = async () => {
    console.log('useChordSettings: Resetting all')
    customMappings.value = {}
    localStorage.removeItem(STORAGE_KEY)
    await saveToDb({})
  }

  return {
    allChords,
    isSyncing,
    getEffectiveChord,
    saveSingleMapping,
    syncWithDb,
    resetAll
  }
}
