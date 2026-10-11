import { calcStreak } from '@/lib/streak'

const day = (iso: string) => `${iso}T10:00:00.000Z`
const NOW = new Date('2026-10-10T12:00:00.000Z')

describe('calcStreak', () => {
  it('is 0 without sessions', () => expect(calcStreak([], NOW)).toBe(0))

  it('counts consecutive days ending today', () => {
    expect(calcStreak([day('2026-10-10'), day('2026-10-09'), day('2026-10-08')], NOW)).toBe(3)
  })

  it('still counts when the last practice was yesterday', () => {
    expect(calcStreak([day('2026-10-09'), day('2026-10-08')], NOW)).toBe(2)
  })

  it('is 0 once a day was skipped', () => {
    expect(calcStreak([day('2026-10-07'), day('2026-10-06')], NOW)).toBe(0)
  })

  it('stops at the first gap and ignores duplicates on the same day', () => {
    expect(calcStreak([day('2026-10-10'), `2026-10-10T20:00:00.000Z`, day('2026-10-09'), day('2026-10-06')], NOW)).toBe(2)
  })
})
