'use client'

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode
} from 'react'
import type { User } from '@supabase/supabase-js'
import { FEATURE_GATES, type FeatureConfig, type FeatureKey } from '@/constants/features'
import type { AppSettings, SubscriptionTier } from '@/types/app'
import { getSupabase } from '@/lib/supabase'
import { HUNDRED_YEARS, ONE_YEAR, writeCookie } from '@/lib/cookie'
import {
  buildAllChords, CHORD_MAPPINGS_COOKIE, getEffectiveChord, type ChordOverride, type CustomMappings
} from '@/lib/chords'

// ---------------------------------------------------------------------------
// Constants (cookie names are shared with the Nuxt app)
// ---------------------------------------------------------------------------
const SETTINGS_COOKIE = 'zettaionkan_app_settings'
const TIER_COOKIE = 'zettaionkan_user_tier'
const OVERRIDES_COOKIE = 'feature_overrides'

export const DEFAULT_SETTINGS: AppSettings = {
  namingConvention: 'italian',
  instrument: 'yamaha',
  colorFormat: 'standard',
  isKeyboardSoundEnabled: true
}

const HIRAGANA_COLORS: Record<string, string> = {
  '赤': 'あか', '黄色': 'きいろ', '青': 'あお', '黒': 'くろ', '緑': 'みどり',
  'オレンジ': 'おれんじ', '紫': 'むらさき', 'ピンク': 'ぴんく', '茶色': 'ちゃいろ',
  '黄緑': 'きみどり', 'ベージュ': 'べーじゅ', '薄橙': 'うすだいだい', '肌色': 'はだいろ',
  '薄紫': 'うすむらさき', '藤色': 'ふじいろ', 'グレー': 'ぐれー', '灰色': 'はいいろ',
  '水色': 'みずいろ', '空色': 'そらいろ'
}

const TIER_ORDER: Record<SubscriptionTier, number> = { free: 0, entry: 1, standard: 2, premium: 3 }

type FeatureOverrides = Record<string, Partial<FeatureConfig>>

export interface InitialState {
  settings: AppSettings
  mappings: CustomMappings
  overrides: FeatureOverrides
  tier: SubscriptionTier
}

interface ProModalState {
  isOpen: boolean
  title: string
  desc: string
}

const DEFAULT_PRO_TITLE = 'PROプラン限定機能'
const DEFAULT_PRO_DESC = 'この機能を使用するにはPROプランへのアップグレードが必要です。'

interface AppContextValue {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  mappings: CustomMappings
  saveSingleMapping: (id: string, mapping: ChordOverride) => void
  resetMappings: () => void
  overrides: FeatureOverrides
  setOverrides: (next: FeatureOverrides) => void
  user: User | null
  tier: SubscriptionTier
  authReady: boolean
  refreshStatus: () => Promise<void>
  proModal: ProModalState
  setProModal: (next: ProModalState) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('AppProvider is missing')
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AppProvider({ initial, children }: { initial: InitialState; children: ReactNode }) {
  const [settings, setSettings] = useState(initial.settings)
  const [mappings, setMappings] = useState(initial.mappings)
  const [overrides, setOverridesState] = useState(initial.overrides)
  const [tier, setTier] = useState<SubscriptionTier>(initial.tier)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [proModal, setProModal] = useState<ProModalState>({ isOpen: false, title: DEFAULT_PRO_TITLE, desc: DEFAULT_PRO_DESC })

  // Latest values for use inside stable callbacks
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const mappingsRef = useRef(mappings)
  mappingsRef.current = mappings

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settingsRef.current, [key]: value }
    settingsRef.current = next
    setSettings(next)
    writeCookie(SETTINGS_COOKIE, next, HUNDRED_YEARS)
  }, [])

  const saveSingleMapping = useCallback((id: string, mapping: ChordOverride) => {
    const next = {
      ...mappingsRef.current,
      [id]: { color: mapping.color, colorName: mapping.colorName, homeEnabled: mapping.homeEnabled }
    }
    mappingsRef.current = next
    setMappings(next)
    writeCookie(CHORD_MAPPINGS_COOKIE, next, HUNDRED_YEARS)
  }, [])

  const resetMappings = useCallback(() => {
    if (!confirm('本当に全ての設定をリセットしますか？')) return
    mappingsRef.current = {}
    setMappings({})
    writeCookie(CHORD_MAPPINGS_COOKIE, {}, HUNDRED_YEARS)
  }, [])

  const setOverrides = useCallback((next: FeatureOverrides) => {
    setOverridesState(next)
    writeCookie(OVERRIDES_COOKIE, next, ONE_YEAR)
  }, [])

  // --- Auth -----------------------------------------------------------------
  const applyUser = useCallback(async (next: User | null) => {
    setUser(next)
    if (!next) {
      setTier('free')
      writeCookie(TIER_COOKIE, 'free', HUNDRED_YEARS)
      return
    }
    const { data } = await getSupabase()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', next.id)
      .single()
    const dbTier = ((data as { subscription_tier?: SubscriptionTier } | null)?.subscription_tier) || 'free'
    // A signed-in user whose DB tier is "free" is treated as "entry"
    const resolved: SubscriptionTier = dbTier === 'free' ? 'entry' : dbTier
    setTier(resolved)
    writeCookie(TIER_COOKIE, resolved, HUNDRED_YEARS)
  }, [])

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await getSupabase().auth.getUser()
      await applyUser(data?.user ?? null)
    } catch (err) {
      console.error('refreshStatus error:', err)
      setTier('free')
    }
  }, [applyUser])

  useEffect(() => {
    const supabase = getSupabase()
    let active = true
    refreshStatus().finally(() => active && setAuthReady(true))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Avoid awaiting Supabase calls inside this callback synchronously
      setTimeout(() => active && applyUser(session?.user ?? null), 0)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [applyUser, refreshStatus])

  const value = useMemo<AppContextValue>(() => ({
    settings, updateSetting, mappings, saveSingleMapping, resetMappings,
    overrides, setOverrides, user, tier, authReady, refreshStatus, proModal, setProModal
  }), [settings, updateSetting, mappings, saveSingleMapping, resetMappings, overrides, setOverrides, user, tier, authReady, refreshStatus, proModal])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ---------------------------------------------------------------------------
// Hooks (names mirror the Nuxt composables)
// ---------------------------------------------------------------------------
export function useAppSettings() {
  const { settings, updateSetting } = useAppContext()

  const formatColorName = useCallback((name: string): string => {
    if (settings.colorFormat === 'hiragana') return HIRAGANA_COLORS[name] || name
    return name
  }, [settings.colorFormat])

  const formatChordName = useCallback((chord: { name?: string; nameIt?: string; symbol?: string } | null): string => {
    if (!chord) return ''
    const strip = (s?: string) => (s ? s.replace(/<[^>]*>/g, '') : '')
    if (settings.namingConvention === 'german') return chord.symbol || strip(chord.name)
    if (settings.namingConvention === 'hybrid') return strip(chord.name)
    return chord.nameIt || strip(chord.name)
  }, [settings.namingConvention])

  return {
    ...settings,
    updateNamingConvention: (v: AppSettings['namingConvention']) => updateSetting('namingConvention', v),
    updateInstrument: (v: string) => updateSetting('instrument', v),
    updateColorFormat: (v: AppSettings['colorFormat']) => updateSetting('colorFormat', v),
    updateKeyboardSound: (v: boolean) => updateSetting('isKeyboardSoundEnabled', v),
    formatColorName,
    formatChordName
  }
}

export function useChordSettings() {
  const { mappings, saveSingleMapping, resetMappings } = useAppContext()
  const allChords = useMemo(() => buildAllChords(mappings), [mappings])
  const getEffective = useCallback((id: string) => getEffectiveChord(mappings, id), [mappings])
  return { allChords, getEffectiveChord: getEffective, saveSingleMapping, resetAll: resetMappings }
}

export function useFeatures() {
  const { overrides, setOverrides } = useAppContext()

  const getFeatureConfig = useCallback((key: FeatureKey): FeatureConfig => {
    const base = FEATURE_GATES[key]
    const override = overrides?.[key]
    return override ? { ...base, ...override } : base
  }, [overrides])

  const isEnabled = useCallback((key: FeatureKey) => getFeatureConfig(key)?.enabled ?? false, [getFeatureConfig])

  const setFeatureState = useCallback((key: FeatureKey, enabled: boolean) => {
    setOverrides({ ...overrides, [key]: { ...overrides[key], enabled } })
  }, [overrides, setOverrides])

  const toggleFeature = useCallback((key: FeatureKey) => {
    setFeatureState(key, !getFeatureConfig(key).enabled)
  }, [getFeatureConfig, setFeatureState])

  return {
    getFeatureConfig, isEnabled, setFeatureState, toggleFeature,
    resetFeatures: () => setOverrides({}),
    featuresList: Object.keys(FEATURE_GATES) as FeatureKey[],
    overrides
  }
}

export function usePro() {
  const { getFeatureConfig, isEnabled } = useFeatures()

  const hasAccess = useCallback((feature: FeatureKey, currentTier: SubscriptionTier): boolean => {
    const config = getFeatureConfig(feature)
    if (!config || !config.enabled) return false
    return (TIER_ORDER[currentTier] ?? 0) >= (TIER_ORDER[config.tier] ?? 0)
  }, [getFeatureConfig])

  return { hasAccess, isEnabled, isPro: (tier: SubscriptionTier) => tier === 'premium' }
}

export function useAuth() {
  const { user, tier, authReady, refreshStatus } = useAppContext()
  return { user, userTier: tier, authReady, refreshStatus }
}

export function useProModal() {
  const { proModal, setProModal } = useAppContext()
  return {
    isOpen: proModal.isOpen,
    modalTitle: proModal.title,
    modalDesc: proModal.desc,
    openProModal: (title?: string, desc?: string) =>
      setProModal({ isOpen: true, title: title || DEFAULT_PRO_TITLE, desc: desc || DEFAULT_PRO_DESC }),
    closeProModal: () => setProModal({ ...proModal, isOpen: false })
  }
}
