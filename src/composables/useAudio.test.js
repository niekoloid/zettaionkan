import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Tone from 'tone'
import { useAudio } from './useAudio'

// Mock Tone.js
vi.mock('tone', () => {
  const mockBuffer = {
    duration: 1.0,
    loaded: true
  }
  
  const mockBufferSource = {
    toDestination: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    fadeIn: 0,
    fadeOut: 0
  }

  return {
    Sampler: vi.fn().mockImplementation(function(config) {
      this.toDestination = vi.fn().mockReturnThis()
      this.triggerAttackRelease = vi.fn()
      if (config.onload) setTimeout(config.onload, 10)
      return this
    }),
    ToneAudioBuffer: {
      fromUrl: vi.fn().mockResolvedValue(mockBuffer)
    },
    BufferSource: vi.fn().mockImplementation(function() {
      return mockBufferSource
    }),
    getContext: vi.fn().mockReturnValue({
      decodeAudioData: vi.fn().mockResolvedValue(mockBuffer)
    }),
    context: {
      state: 'suspended',
      resume: vi.fn().mockResolvedValue(),
    },
    start: vi.fn().mockResolvedValue(),
    now: vi.fn().mockReturnValue(100),
  }
})

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: { value: { id: 'test' } },
    userTier: { value: 'premium' }
  })
}))

describe('useAudio.js (Stateless Playback Implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadNarration should use ToneAudioBuffer.fromUrl', async () => {
    const { loadNarration, isLoaded } = useAudio()
    
    // Clear previous state if possible (though it's a singleton)
    const success = await loadNarration()
    
    expect(success).toBe(true)
    expect(Tone.ToneAudioBuffer.fromUrl).toHaveBeenCalled()
    expect(isLoaded.value.narration).toBe(true)
  })

  it('playNarration should create and start a BufferSource', async () => {
    const { playNarration, loadNarration } = useAudio()
    
    await loadNarration()
    const result = await playNarration('赤')
    
    expect(result).toBe(true)
    expect(Tone.BufferSource).toHaveBeenCalled()
    
    // Verify properties were set on the mock source
    const mockSource = vi.mocked(Tone.BufferSource).mock.results[0].value
    expect(mockSource.toDestination).toHaveBeenCalled()
    expect(mockSource.start).toHaveBeenCalled()
  })

  it('playEffect should also use BufferSource', async () => {
    const { playEffect, loadEffects } = useAudio()
    
    await loadEffects()
    const result = await playEffect('correct')
    
    expect(result).toBe(true)
    expect(Tone.BufferSource).toHaveBeenCalled()
    
    const mockSource = vi.mocked(Tone.BufferSource).mock.results[0].value
    expect(mockSource.start).toHaveBeenCalled()
  })

  it('should resume context if it is suspended', async () => {
    const { playNarration, loadNarration } = useAudio()
    Tone.context.state = 'suspended'
    
    await loadNarration()
    await playNarration('青')
    
    expect(Tone.context.resume).toHaveBeenCalled()
  })
})
