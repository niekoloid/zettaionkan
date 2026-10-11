'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/app-context'
import { ONE_YEAR, readCookie, writeCookie } from '@/lib/cookie'

const CUSTOM_VOICE_BUCKET = 'narration_custom'
const ENABLED_COOKIE = 'zettaionkan_custom_voice_enabled'

interface VoiceContextValue {
  customVoiceEnabled: boolean
  availableVoices: Set<string>
  isLoadingVoices: boolean
  fetchAvailableVoices: () => Promise<void>
  updateSettings: (enabled: boolean) => void
  uploadVoice: (colorName: string, blob: Blob) => Promise<boolean>
  deleteVoice: (colorName: string) => Promise<boolean>
  getVoiceUrl: (colorName: string) => string | null
}

const VoiceCtx = createContext<VoiceContextValue | null>(null)

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [customVoiceEnabled, setCustomVoiceEnabled] = useState(() => readCookie<boolean>(ENABLED_COOKIE, false) === true)
  const [availableVoices, setAvailableVoices] = useState<Set<string>>(new Set())
  const [isLoadingVoices, setIsLoadingVoices] = useState(false)

  const fetchAvailableVoices = useCallback(async () => {
    if (!user) return
    setIsLoadingVoices(true)
    try {
      const { data, error } = await getSupabase().storage.from(CUSTOM_VOICE_BUCKET).list(user.id)
      if (error) throw error
      setAvailableVoices(new Set((data ?? []).map(f => f.name.replace('.webm', ''))))
    } catch (e) {
      console.error('Failed to fetch custom voices:', e)
    } finally {
      setIsLoadingVoices(false)
    }
  }, [user])

  const uploadVoice = useCallback(async (colorName: string, blob: Blob) => {
    if (!user) return false
    try {
      const { error } = await getSupabase().storage
        .from(CUSTOM_VOICE_BUCKET)
        .upload(`${user.id}/${colorName}.webm`, blob, { upsert: true, contentType: 'audio/webm' })
      if (error) throw error
      setAvailableVoices(prev => new Set(prev).add(colorName))
      return true
    } catch (e) {
      console.error(`Failed to upload voice for ${colorName}:`, e)
      return false
    }
  }, [user])

  const deleteVoice = useCallback(async (colorName: string) => {
    if (!user) return false
    try {
      const { error } = await getSupabase().storage.from(CUSTOM_VOICE_BUCKET).remove([`${user.id}/${colorName}.webm`])
      if (error) throw error
      setAvailableVoices(prev => { const n = new Set(prev); n.delete(colorName); return n })
      return true
    } catch (e) {
      console.error(`Failed to delete voice for ${colorName}:`, e)
      return false
    }
  }, [user])

  const getVoiceUrl = useCallback((colorName: string) => {
    if (!user || !availableVoices.has(colorName)) return null
    return getSupabase().storage.from(CUSTOM_VOICE_BUCKET).getPublicUrl(`${user.id}/${colorName}.webm`).data.publicUrl
  }, [user, availableVoices])

  const updateSettings = useCallback((enabled: boolean) => {
    setCustomVoiceEnabled(enabled)
    writeCookie(ENABLED_COOKIE, enabled, ONE_YEAR)
  }, [])

  const value = useMemo(() => ({
    customVoiceEnabled, availableVoices, isLoadingVoices, fetchAvailableVoices, updateSettings, uploadVoice, deleteVoice, getVoiceUrl
  }), [customVoiceEnabled, availableVoices, isLoadingVoices, fetchAvailableVoices, updateSettings, uploadVoice, deleteVoice, getVoiceUrl])

  return <VoiceCtx.Provider value={value}>{children}</VoiceCtx.Provider>
}

export function useVoiceSettings() {
  const ctx = useContext(VoiceCtx)
  if (!ctx) throw new Error('VoiceProvider is missing')
  return ctx
}
