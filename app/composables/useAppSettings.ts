import { computed } from 'vue'
import type { AppSettings } from '~/types/app'

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

const DEFAULT_SETTINGS: AppSettings = {
  namingConvention: 'italian',
  instrument: 'yamaha',
  colorFormat: 'standard',
  isKeyboardSoundEnabled: true
}

export function useAppSettings() {
  // Use Nuxt's useCookie for seamless SSR and simplified persistence
  const settings = useCookie<AppSettings>(STORAGE_KEY, {
    default: () => ({ ...DEFAULT_SETTINGS }),
    watch: true,
    maxAge: 60 * 60 * 24 * 365 * 100 // 100 years
  })

  // Removed DB sync logic to simplify structure as requested.
  // All settings are now managed purely through Cookies.

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settings.value = {
      ...settings.value,
      [key]: value
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

  return {
    namingConvention: computed(() => settings.value.namingConvention),
    instrument: computed(() => settings.value.instrument),
    colorFormat: computed(() => settings.value.colorFormat),
    isKeyboardSoundEnabled: computed(() => settings.value.isKeyboardSoundEnabled),
    updateNamingConvention: (val: AppSettings['namingConvention']) => updateSetting('namingConvention', val),
    updateInstrument: (val: string) => updateSetting('instrument', val),
    updateColorFormat: (val: AppSettings['colorFormat']) => updateSetting('colorFormat', val),
    updateKeyboardSound: (val: boolean) => updateSetting('isKeyboardSoundEnabled', val),
    formatColorName,
    formatChordName
  }
}
