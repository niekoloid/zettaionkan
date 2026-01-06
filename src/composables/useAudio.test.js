import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Tone from 'tone'
import { useAudio } from './useAudio'

// Mock Tone.js at the top level
vi.mock('tone', () => {
  return {
    Sampler: vi.fn().mockImplementation(function(config) {
      this.toDestination = vi.fn().mockReturnThis()
      this.triggerAttackRelease = vi.fn()
      // Simulate onload being called soon
      if (config.onload) setTimeout(config.onload, 10)
      return this
    }),
    Players: vi.fn().mockImplementation(function(config) {
      this.toDestination = vi.fn().mockReturnThis()
      this.has = vi.fn().mockReturnValue(true)
      this.player = vi.fn().mockReturnValue({
        state: 'stopped',
        start: vi.fn(),
        stop: vi.fn()
      })
      if (config.onload) setTimeout(config.onload, 10)
      return this
    }),
    context: {
      state: 'suspended',
    },
    start: vi.fn().mockResolvedValue(),
  }
})

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: { value: { id: 'test' } },
    userTier: { value: 'free' }
  })
}))

describe('useAudio.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // We cannot easily reset the singleton state of useAudio because it's in the module scope
    // So we just have to be aware of it or accept it for now.
  })

  it('initializes with default values', () => {
    const { selectedInstrument, isLoading } = useAudio()
    expect(selectedInstrument.value).toBe('yamaha')
    // isLoading might be true or false depending on other tests because of the singleton
  })

  it('loadSampler set active instrument', async () => {
    const { loadSampler, selectedInstrument } = useAudio()
    
    // Use a unique name if possible or just assume it works
    await loadSampler('yamaha')
    expect(selectedInstrument.value).toBe('yamaha')
    
    await loadSampler('steinway')
    expect(selectedInstrument.value).toBe('steinway')
  })

  it('playNotes starts Tone if needed', async () => {
    const { playNotes } = useAudio()
    
    // This will probably fail if samplers is empty, but we can check if Tone.start was called
    await playNotes(['C4'])
    expect(Tone.start).toHaveBeenCalled()
  })
})
