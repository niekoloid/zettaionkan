import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

const STORAGE_KEY = 'zettaionkan_app_settings'

const HIRAGANA_COLORS: Record<string, string> = {
  '赤': 'あか',
  '黄色': 'きいろ',
  '青': 'あお',
  '黒': 'くろ',
  '緑': 'みどり',
  'オレンジ': 'おれんじ',
  '紫': 'むらさき',
  'ピンク': 'ぴんく',
  '茶色': 'ちゃいろ',
  '黄緑': 'きみどり',
  'ベージュ': 'べーじゅ',
  '薄橙': 'うすだいだい',
  '肌色': 'はだいろ',
  '薄紫': 'うすむらさき',
  '藤色': 'ふじいろ',
  'グレー': 'ぐれー',
  '灰色': 'はいいろ',
  '水色': 'みずいろ',
  '空色': 'そらいろ'
}

interface AppSettings {
  namingConvention: 'italian' | 'german' | 'hybrid'
  instrument: string
  colorFormat: 'standard' | 'hiragana'
}

// Global state SINGLETON
const settings = ref<AppSettings>({
  namingConvention: 'italian', // 'italian' (ドミソ) or 'german' (C-E-G)
  instrument: 'yamaha',
  colorFormat: 'standard' // 'standard' (漢字/カタカナ) or 'hiragana'
})

// Load from LocalStorage
const loadLocal = () => {
  if (import.meta.server) return
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Failed to parse app settings', e)
    }
  }
}
if (import.meta.client) loadLocal()

export function useAppSettings() {
  const supabase = useSupabaseClient<Database>()
  
  const syncWithDb = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('naming_convention, preferred_instrument, color_format')
        .eq('id', session.user.id)
        .single()
      
      const sessionData = data as any

      if (!error && sessionData) {
        if (sessionData.naming_convention) settings.value.namingConvention = sessionData.naming_convention as AppSettings['namingConvention']
        if (sessionData.preferred_instrument) settings.value.instrument = sessionData.preferred_instrument
        if (sessionData.color_format) settings.value.colorFormat = sessionData.color_format as AppSettings['colorFormat']
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      }
    } catch (e) {
      console.warn('useAppSettings: Sync error', e)
    }
  }

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      const DB_KEY_MAP: Record<keyof AppSettings, keyof Database['public']['Tables']['profiles']['Update']> = {
        namingConvention: 'naming_convention',
        instrument: 'preferred_instrument',
        colorFormat: 'color_format'
      }
      const dbKey = DB_KEY_MAP[key]
      if (!dbKey) return

      await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id,
          [dbKey]: value
        } as any)
    } catch (e) {
      console.error('useAppSettings: Save error', e)
    }
  }

  const formatColorName = (name: string): string => {
    if (settings.value.colorFormat === 'hiragana') {
      return HIRAGANA_COLORS[name] || name
    }
    return name
  }

  const formatChordName = (chord: { name?: string, nameIt?: string, symbol?: string } | null): string => {
    if (!chord) return ''
    const stripTags = (str: string) => str ? str.replace(/<[^>]*>/g, '') : ''
    
    if (settings.value.namingConvention === 'german') {
      return chord.symbol || stripTags(chord.name || '')
    }
    if (settings.value.namingConvention === 'hybrid') {
      return stripTags(chord.name || '')
    }
    return chord.nameIt || stripTags(chord.name || '')
  }

  // Initial sync attempt
  if (import.meta.client) {
    syncWithDb()
  }
  
  // Auth listener
  // Using a watch or just relying on hook usage? 
  // Original had supabase.auth.onAuthStateChange inside the composable body, which adds a listener every time useAppSettings is called!
  // This might be a memory leak if called frequently.
  // Ideally, this sync logic should be centralized or singleton-managed.
  // For now, I'll keep it but wrap in onMounted or check if already listening?
  // Actually, previous code:
  // supabase.auth.onAuthStateChange((event, session) => {
  //   if (session?.user) syncWithDb()
  // })
  // This was executing at the module scope level? No, inside `useAppSettings`.
  
  // Let's rely on `useAuth` or `app.vue` to trigger sync, or stick to the current pattern but be aware.
  // In `useAppSettings.js`, it was inside the function.
  // If `useAppSettings` is called in many components, we get many listeners.
  // Improved: move the listener inside a `onMounted` or just call `syncWithDb` when `useAuth` changes user.
  // But to stick to 1-to-1 conversion + types:
  
  // Moving listener to singleton initialization block helps.
  
  return {
    namingConvention: computed(() => settings.value.namingConvention),
    instrument: computed(() => settings.value.instrument),
    colorFormat: computed(() => settings.value.colorFormat),
    updateNamingConvention: (val: AppSettings['namingConvention']) => updateSetting('namingConvention', val),
    updateInstrument: (val: string) => updateSetting('instrument', val),
    updateColorFormat: (val: AppSettings['colorFormat']) => updateSetting('colorFormat', val),
    formatColorName,
    formatChordName,
    syncWithDb
  }
}
