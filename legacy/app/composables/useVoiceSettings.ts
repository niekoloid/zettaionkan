import { ref, computed } from 'vue'
import { useAuth } from './useAuth'

const CUSTOM_VOICE_BUCKET = 'narration_custom'

// Singleton state
const customVoiceEnabled = ref(false)
const availableVoices = ref<Set<string>>(new Set())
const isLoadingVoices = ref(false)
const isSettingsLoaded = ref(false)

export function useVoiceSettings() {
  const supabase = useSupabaseClient()
  const { user } = useAuth()

  const fetchAvailableVoices = async () => {
    if (!user.value) return
    isLoadingVoices.value = true
    try {
      const { data, error } = await supabase
        .storage
        .from(CUSTOM_VOICE_BUCKET)
        .list(user.value.id)

      if (error) throw error
      
      availableVoices.value = new Set(data.map(f => f.name.replace('.webm', '')))
    } catch (e) {
      console.error('Failed to fetch custom voices:', e)
    } finally {
      isLoadingVoices.value = false
    }
  }

  const uploadVoice = async (colorName: string, blob: Blob) => {
    if (!user.value) return false
    
    const fileName = `${user.value.id}/${colorName}.webm`
    try {
      const { error } = await supabase
        .storage
        .from(CUSTOM_VOICE_BUCKET)
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'audio/webm'
        })

      if (error) throw error
      
      availableVoices.value.add(colorName)
      return true
    } catch (e) {
      console.error(`Failed to upload voice for ${colorName}:`, e)
      return false
    }
  }

  const deleteVoice = async (colorName: string) => {
    if (!user.value) return false
    
    const fileName = `${user.value.id}/${colorName}.webm`
    try {
      const { error } = await supabase
        .storage
        .from(CUSTOM_VOICE_BUCKET)
        .remove([fileName])

      if (error) throw error
      
      availableVoices.value.delete(colorName)
      return true
    } catch (e) {
      console.error(`Failed to delete voice for ${colorName}:`, e)
      return false
    }
  }

  const getVoiceUrl = (colorName: string) => {
    if (!user.value || !availableVoices.value.has(colorName)) return null
    
    const { data } = supabase
      .storage
      .from(CUSTOM_VOICE_BUCKET)
      .getPublicUrl(`${user.value.id}/${colorName}.webm`)
    
    return data.publicUrl
  }

  // Persistent settings via Cookie
  const customVoiceEnabledCookie = useCookie<boolean>('zettaionkan_custom_voice_enabled', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  // Sync singleton ref with cookie
  if (import.meta.client && !isSettingsLoaded.value) {
    customVoiceEnabled.value = customVoiceEnabledCookie.value
    isSettingsLoaded.value = true
  }

  const fetchSettings = async () => {
    // Legacy: Now handled by Cookie initialization
    if (import.meta.client) {
      customVoiceEnabled.value = customVoiceEnabledCookie.value
    }
  }

  const updateSettings = async (enabled: boolean) => {
    customVoiceEnabled.value = enabled
    customVoiceEnabledCookie.value = enabled
  }

  return {
    customVoiceEnabled,
    availableVoices,
    isLoadingVoices,
    fetchAvailableVoices,
    fetchSettings,
    updateSettings,
    uploadVoice,
    deleteVoice,
    getVoiceUrl
  }
}
