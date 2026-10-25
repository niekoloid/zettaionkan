import { describe, expect, it } from 'vitest'
import { checkPromotion, chordStats, isStuck, pickChord, weekDays, type Lesson } from './engine'
import { lessonCalendar } from './ics'
import { maxLevelFor } from './plans'

let n = 0
const lesson = (day: string, level: number, right: number, wrong = 0, chordId = 'domiso'): Lesson => ({
  id: String(n++),
  startedAt: new Date(`${day}T10:00:00`).toISOString(),
  finishedAt: new Date(`${day}T10:01:00`).toISOString(),
  level,
  answers: [
    ...Array.from({ length: right }, () => ({ chordId, correct: true })),
    ...Array.from({ length: wrong }, () => ({ chordId, correct: false }))
  ]
})

describe('checkPromotion', () => {
  it('needs three lessons', () => {
    const r = checkPromotion([lesson('2026-10-20', 2, 10), lesson('2026-10-21', 2, 10)], 2)
    expect(r.ready).toBe(false)
    expect(r.hint).toContain('あと1回')
  })

  it('needs more than one day', () => {
    const day = '2026-10-20'
    expect(checkPromotion([lesson(day, 2, 10), lesson(day, 2, 10), lesson(day, 2, 10)], 2).ready).toBe(false)
  })

  it('promotes after three good lessons over two days', () => {
    const ls = [lesson('2026-10-20', 2, 10), lesson('2026-10-20', 2, 9, 1), lesson('2026-10-21', 2, 10)]
    expect(checkPromotion(ls, 2).ready).toBe(true)
  })

  it('holds back when one lesson was weak', () => {
    const ls = [lesson('2026-10-20', 2, 10), lesson('2026-10-20', 2, 7, 3), lesson('2026-10-21', 2, 10)]
    expect(checkPromotion(ls, 2).ready).toBe(false)
  })

  it('ignores short lessons and other levels', () => {
    const ls = [lesson('2026-10-20', 1, 10), lesson('2026-10-20', 2, 3), lesson('2026-10-21', 2, 10), lesson('2026-10-22', 2, 10)]
    expect(checkPromotion(ls, 2).ready).toBe(false)
  })

  it('stops at the last chord', () => {
    expect(checkPromotion([], 14).ready).toBe(false)
  })
})

describe('pickChord', () => {
  it('only uses unlocked chords', () => {
    for (let i = 0; i < 200; i++) expect(['domiso', 'dofara', 'shireso']).toContain(pickChord(3, [], {}))
  })

  it('always picks the single chord at level 1', () => {
    expect(pickChord(1, ['domiso', 'domiso'], {})).toBe('domiso')
  })

  it('never asks the same chord three times in a row', () => {
    for (let i = 0; i < 200; i++) expect(pickChord(2, ['dofara', 'dofara'], {})).toBe('domiso')
  })

  it('favours the newest chord', () => {
    let newest = 0
    let seed = 1
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 3000; i++) if (pickChord(3, [], {}, rand) === 'shireso') newest++
    expect(newest / 3000).toBeGreaterThan(0.33)
    expect(newest / 3000).toBeLessThan(0.47)
  })
})

describe('stats and week', () => {
  it('computes per-chord accuracy', () => {
    const s = chordStats([lesson('2026-10-20', 1, 3, 1)])
    expect(s.domiso).toEqual({ count: 4, accuracy: 0.75 })
  })

  it('flags a long weak run', () => {
    const ls = Array.from({ length: 12 }, (_, i) => lesson(`2026-10-${10 + i}`, 3, 5, 5))
    expect(isStuck(ls, 3)).toBe(true)
    expect(isStuck(ls.slice(0, 11), 3)).toBe(false)
  })

  it('lists Monday to Sunday', () => {
    const w = weekDays([lesson('2026-10-21', 1, 5)], new Date('2026-10-23T12:00:00'))
    expect(w.map(d => d.label).join('')).toBe('月火水木金土日')
    expect(w[0]!.key).toBe('2026-10-19')
    expect(w[2]!.done).toBe(true)
    expect(w[4]!.isToday).toBe(true)
  })
})

describe('plans and calendar', () => {
  it('limits free to three chords, unlimited to all', () => {
    expect(maxLevelFor('free', false)).toBe(3)
    expect(maxLevelFor('standard', false)).toBe(9)
    expect(maxLevelFor('premium', false)).toBe(14)
    expect(maxLevelFor('free', true)).toBe(14)
  })

  it('writes one daily event per time', () => {
    const ics = lessonCalendar(['07:30', '19:05'], 'https://example.com/lesson', new Date('2026-10-25T00:00:00Z'))
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('T073000')
    expect(ics).toContain('T190500')
    expect(ics).toContain('RRULE:FREQ=DAILY')
  })
})
