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

  const fetchSettings = async () => {
    if (!user.value) return
    try {
      const { data, error } = await (supabase
        .from('user_audio_settings') as any)
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      
      if (data) {
        customVoiceEnabled.value = data.custom_voice_enabled
      }
    } catch (e) {
      console.error('Failed to fetch user audio settings:', e)
    }
  }

  const updateSettings = async (enabled: boolean) => {
    if (!user.value) return
    customVoiceEnabled.value = enabled
    try {
      const { error } = await (supabase
        .from('user_audio_settings') as any)
        .upsert({
          user_id: user.value.id,
          custom_voice_enabled: enabled,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (e) {
      console.error('Failed to update user audio settings:', e)
    }
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
