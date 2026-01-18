import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'zettaionkan_app_settings'

const HIRAGANA_COLORS = {
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

// Global state SINGLETON
const settings = ref({
  namingConvention: 'italian', // 'italian' (ドミソ) or 'german' (C-E-G)
  instrument: 'yamaha',
  colorFormat: 'standard' // 'standard' (漢字/カタカナ) or 'hiragana'
})

// Load from LocalStorage
const loadLocal = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Failed to parse app settings', e)
    }
  }
}
loadLocal()

export function useAppSettings() {
  
  const syncWithDb = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('naming_convention, preferred_instrument, color_format')
        .eq('id', session.user.id)
        .maybeSingle()
      
      if (data) {
        if (data.naming_convention) settings.value.namingConvention = data.naming_convention
        if (data.preferred_instrument) settings.value.instrument = data.preferred_instrument
        if (data.color_format) settings.value.colorFormat = data.color_format
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      }
    } catch (e) {
      console.warn('useAppSettings: Sync error', e)
    }
  }

  const updateSetting = async (key, value) => {
    settings.value[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      const DB_KEY_MAP = {
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
        })
    } catch (e) {
      console.error('useAppSettings: Save error', e)
    }
  }

  const formatColorName = (name) => {
    if (settings.value.colorFormat === 'hiragana') {
      return HIRAGANA_COLORS[name] || name
    }
    return name
  }

  const formatChordName = (chord) => {
    if (!chord) return ''
    const stripTags = (str) => str ? str.replace(/<[^>]*>/g, '') : ''
    
    if (settings.value.namingConvention === 'german') {
      return chord.symbol || stripTags(chord.name)
    }
    if (settings.value.namingConvention === 'hybrid') {
      return stripTags(chord.name)
    }
    return chord.nameIt || stripTags(chord.name)
  }

  // Initial sync attempt
  syncWithDb()
  
  // Auth listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) syncWithDb()
  })

  return {
    namingConvention: computed(() => settings.value.namingConvention),
    instrument: computed(() => settings.value.instrument),
    colorFormat: computed(() => settings.value.colorFormat),
    updateNamingConvention: (val) => updateSetting('namingConvention', val),
    updateInstrument: (val) => updateSetting('instrument', val),
    updateColorFormat: (val) => updateSetting('colorFormat', val),
    formatColorName,
    formatChordName,
    syncWithDb
  }
}
