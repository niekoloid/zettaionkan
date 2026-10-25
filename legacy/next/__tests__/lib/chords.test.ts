import { buildAllChords, getEffectiveChord, isLightColor } from '@/lib/chords'

describe('chords', () => {
  it('builds the 14 primary chords in level order', () => {
    const chords = buildAllChords({})
    expect(chords).toHaveLength(14)
    expect(chords.map(c => c.sortOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    expect(chords[0]!.id).toBe('domiso')
    expect(chords.every(c => c.homeEnabled === false)).toBe(true)
  })

  it('applies colour / name / home overrides', () => {
    const chords = buildAllChords({ domiso: { color: '#123456', colorName: '青', homeEnabled: true } })
    expect(chords[0]).toMatchObject({ color: '#123456', colorName: '青', homeEnabled: true })
    expect(chords[1]!.color).toBe('#FFD700') // untouched
  })

  it('maps inversions to the override of their primary chord', () => {
    const e = getEffectiveChord({ lacismi: { color: '#000001', colorName: 'x' } }, 'milacis')
    expect(e?.id).toBe('milacis')
    expect(e?.color).toBe('#000001')
    expect(getEffectiveChord({}, 'nope')).toBeNull()
  })

  it('detects light colours (dark text) vs dark colours (white text)', () => {
    expect(isLightColor('#FFD700')).toBe(true)
    expect(isLightColor('#F5DEB3')).toBe(true)
    expect(isLightColor('#000000')).toBe(false)
    expect(isLightColor('#0000FF')).toBe(false)
  })
})
