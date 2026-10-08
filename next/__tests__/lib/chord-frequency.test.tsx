import { act, renderHook } from '@testing-library/react'
import { useChordFrequency } from '@/lib/chord-frequency'

const chords = [1, 2, 3, 4].map(n => ({ id: `c${n}`, color: '#000', displayColor: `色${n}`, sortOrder: n }))

describe('useChordFrequency', () => {
  it('treats the highest level as the "new" chord and the rest as review', () => {
    const { result } = renderHook(() => useChordFrequency(chords))
    expect(result.current.parentChord?.id).toBe('c4')
    expect(result.current.otherChords.map(c => c.id)).toEqual(['c1', 'c2', 'c3'])
    expect(result.current.otherChordsDisplay).toBe('色1・色2・色3')
  })

  it('abbreviates long review lists', () => {
    const six = [1, 2, 3, 4, 5, 6].map(n => ({ id: `c${n}`, color: '#000', displayColor: `色${n}`, sortOrder: n }))
    const { result } = renderHook(() => useChordFrequency(six))
    expect(result.current.otherChordsDisplay).toBe('色1・色2・色3など')
  })

  it('weights review chords equally, or towards basics when review weighting is on', () => {
    const { result } = renderHook(() => useChordFrequency(chords))
    expect(result.current.otherChordsWithWeights.map(c => c.weight)).toEqual([1 / 3, 1 / 3, 1 / 3])
    act(() => result.current.setIsReviewWeighted(true))
    const w = result.current.otherChordsWithWeights.map(c => c.weight)
    expect(w[0]).toBeGreaterThan(w[1]!)
    expect(w[1]).toBeGreaterThan(w[2]!)
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })

  it('draws the new chord about `ratio` of the time', () => {
    const { result } = renderHook(() => useChordFrequency(chords, { ratio: 0.5 }))
    const spy = jest.spyOn(Math, 'random')
    spy.mockReturnValue(0.1) // < ratio -> new chord
    expect(result.current.getRandomChord()?.id).toBe('c4')
    spy.mockReturnValue(0.9) // >= ratio -> a review chord
    expect(result.current.getRandomChord()?.id).not.toBe('c4')
    spy.mockRestore()
  })

  it('handles empty and single selections', () => {
    const { result: empty } = renderHook(() => useChordFrequency([]))
    expect(empty.current.getRandomChord()).toBeNull()
    const { result: one } = renderHook(() => useChordFrequency([chords[0]!]))
    expect(one.current.getRandomChord()?.id).toBe('c1')
  })
})
