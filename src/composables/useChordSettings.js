import { ref, computed } from 'vue'
import { ChordDefinitions } from '../constants/chords'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'zettaionkan_custom_chords'

// Global state to share across components - SINGLETON
const customMappings = ref({})
const isSyncing = ref(false)

// 1 INITIAL LOAD: LocalStorage (Fastest)
const loadLocal = () => {
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
loadLocal()

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
    
    if (error) throw error

    if (data?.custom_chords && Object.keys(data.custom_chords).length > 0) {
      console.log('useChordSettings: DB settings found', data.custom_chords)
      // Merge DB settings, DB takes priority
      const merged = { ...customMappings.value, ...data.custom_chords }
      customMappings.value = merged
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    }
  } catch (e) {
    console.warn('useChordSettings: DB sync error', e.message)
  } finally {
    isSyncing.value = false
  }
}

// 3 AUTO-SYNC ON AUTH CHANGES
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    syncWithDb()
  }
})

// Initial sync on module load
syncWithDb()

// 14 Primary Chord IDs for absolute pitch training
const PRIMARY_CHORD_IDS = [
  'domiso', 'dofara', 'shireso', 'radofa', 'resoshi', 
  'misodo', 'farado', 'soshire', 'sodomi',
  'lacismi', 'refisla', 'migissi', 'berefa', 'essobe'
]

// Mapping inversions to their root IDs to share settings
const INVERSION_MAP = {
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
  
  const saveToDb = async (newMappings) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    try {
      console.log('useChordSettings: Saving to DB...', newMappings)
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          custom_chords: newMappings
        })
      
      if (error) throw error
      console.log('useChordSettings: DB update successful')
    } catch (e) {
      console.error('useChordSettings: DB save error details:', e)
    }
  }

  const getEffectiveChord = (id) => {
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

  const allChords = computed(() => {
    return PRIMARY_CHORD_IDS.map(id => {
      const base = Object.values(ChordDefinitions).find(c => c.id === id)
      if (!base) return null
      
      const override = customMappings.value[id]
      return {
        ...base,
        color: override?.color || base.color,
        colorName: override?.colorName || base.colorName
      }
    }).filter(Boolean)
  })

  const saveSingleMapping = async (id, mapping) => {
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
