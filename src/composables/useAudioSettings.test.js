import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioSettings } from './useAudioSettings'

describe('useAudioSettings.js', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('gets default instrument when nothing is set', () => {
    const { getPreferredInstrument } = useAudioSettings()
    expect(getPreferredInstrument()).toBe('yamaha')
  })

  it('sets and gets preferred instrument', () => {
    const { getPreferredInstrument, setPreferredInstrument } = useAudioSettings()
    setPreferredInstrument('steinway')
    expect(getPreferredInstrument()).toBe('steinway')
    expect(localStorage.getItem('preferred_instrument')).toBe('steinway')
  })
})
