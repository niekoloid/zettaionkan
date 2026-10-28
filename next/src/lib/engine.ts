import { CHORD_BY_ID, CHORDS, chordsForLevel } from './chords'

export interface Answer {
  chordId: string
  correct: boolean
  /** The colour the child raised instead, when the parent picked it (wrong answers only) */
  raised?: string
}

export interface Lesson {
  id: string
  /** ISO time */
  startedAt: string
  finishedAt: string
  /** Number of chords in play during the lesson */
  level: number
  answers: Answer[]
  /** Two chords played against each other (くらべっこ). These lessons do not count toward promotion. */
  focus?: [string, string]
}

/** How many correct answers in a row of lessons we want before suggesting a new chord */
export const PROMOTION = {
  lessons: 3,
  minAnswers: 5,
  accuracy: 0.9,
  lessonFloor: 0.8,
  days: 2,
  /** Mix-ups involving the newest chord, across the counted lessons, that still block promotion */
  confusions: 2
}

/** How many mix-ups of one pair, in the recent answers, before suggesting くらべっこ */
export const FOCUS_SUGGEST = { window: 60, count: 3 }

export const accuracy = (answers: Answer[]) =>
  answers.length === 0 ? 0 : answers.filter(a => a.correct).length / answers.length

/** Local calendar day, YYYY-MM-DD */
export const dayKey = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface PromotionCheck {
  ready: boolean
  /** Lessons at the current level that count toward the check (newest first) */
  counted: Lesson[]
  /** What is still missing, for the parent */
  hint: string
}

/**
 * Suggest the next chord when the last few lessons at the current level were nearly all right,
 * spread over more than one day (one good evening is not enough).
 */
export function checkPromotion(lessons: Lesson[], level: number): PromotionCheck {
  if (level >= CHORDS.length) return { ready: false, counted: [], hint: 'すべての和音に進みました' }
  const atLevel = lessons
    .filter(l => !l.focus && l.level === level && l.answers.length >= PROMOTION.minAnswers)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  const counted = atLevel.slice(0, PROMOTION.lessons)
  if (counted.length < PROMOTION.lessons) {
    return { ready: false, counted, hint: `あと${PROMOTION.lessons - counted.length}回のレッスンで判定します` }
  }
  const all = counted.flatMap(l => l.answers)
  const days = new Set(counted.map(l => dayKey(l.startedAt))).size
  if (days < PROMOTION.days) return { ready: false, counted, hint: '別の日にもう一度できたら判定します' }
  const total = accuracy(all)
  const floor = Math.min(...counted.map(l => accuracy(l.answers)))
  if (total < PROMOTION.accuracy || floor < PROMOTION.lessonFloor) {
    return { ready: false, counted, hint: `直近${PROMOTION.lessons}回の正解率 ${Math.round(total * 100)}%（目安 ${PROMOTION.accuracy * 100}%）` }
  }
  const newest = CHORDS[level - 1]!.id
  const [worst] = confusions(counted, Infinity).filter(c => c.pair.includes(newest))
  if (worst && worst.count >= PROMOTION.confusions) {
    const [a, b] = worst.pair.map(id => CHORD_BY_ID[id]!.kana)
    return { ready: false, counted, hint: `「${a}」と「${b}」の取り違えがまだあります` }
  }
  return { ready: true, counted, hint: '次の和音に進めます' }
}

/** Long run at one level with low accuracy: suggest fewer chords for a while */
export function isStuck(lessons: Lesson[], level: number) {
  if (level <= 1) return false
  const atLevel = lessons.filter(l => !l.focus && l.level === level).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  if (atLevel.length < 12) return false
  return accuracy(atLevel.slice(0, 6).flatMap(l => l.answers)) < 0.7
}

/** Per-chord accuracy over the most recent `window` answers for each chord */
export function chordStats(lessons: Lesson[], window = 30) {
  const byChord: Record<string, Answer[]> = {}
  const sorted = [...lessons].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  for (const l of sorted) {
    for (let i = l.answers.length - 1; i >= 0; i--) {
      const a = l.answers[i]!
      const list = (byChord[a.chordId] ??= [])
      if (list.length < window) list.push(a)
    }
  }
  return Object.fromEntries(
    Object.entries(byChord).map(([id, list]) => [id, { count: list.length, accuracy: accuracy(list) }])
  ) as Record<string, { count: number; accuracy: number }>
}

const pairKey = (a: string, b: string): [string, string] => {
  const ia = CHORDS.findIndex(c => c.id === a)
  const ib = CHORDS.findIndex(c => c.id === b)
  return ia <= ib ? [a, b] : [b, a]
}

/**
 * Mix-ups the parent recorded (a wrong answer with the colour raised), counted per pair of chords
 * regardless of direction, over the most recent `window` answers. Most frequent first.
 */
export function confusions(lessons: Lesson[], window = 150) {
  const sorted = [...lessons].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  const counts = new Map<string, { pair: [string, string]; count: number }>()
  let seen = 0
  for (const l of sorted) {
    for (let i = l.answers.length - 1; i >= 0 && seen < window; i--, seen++) {
      const a = l.answers[i]!
      if (a.correct || !a.raised || a.raised === a.chordId) continue
      const pair = pairKey(a.chordId, a.raised)
      const key = pair.join('/')
      const entry = counts.get(key) ?? { pair, count: 0 }
      entry.count++
      counts.set(key, entry)
    }
    if (seen >= window) break
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}

/** The pair worth a くらべっこ lesson now, if any: mixed up often lately, both chords in play */
export function suggestFocus(lessons: Lesson[], level: number): [string, string] | null {
  const inPlay = new Set(chordsForLevel(level).map(c => c.id))
  const top = confusions(lessons, FOCUS_SUGGEST.window).find(c => c.pair.every(id => inPlay.has(id)))
  return top && top.count >= FOCUS_SUGGEST.count ? top.pair : null
}

/** Extra weight for chords in recorded mix-ups, so both sides of a mix-up come up more */
export function confusionWeights(lessons: Lesson[]) {
  const w: Record<string, number> = {}
  for (const { pair, count } of confusions(lessons, FOCUS_SUGGEST.window)) {
    for (const id of pair) w[id] = (w[id] ?? 0) + Math.min(count, 4) * 0.25
  }
  return w
}

/** くらべっこ: one of the two chords, never the same one three times in a row */
export function pickFocus(pair: [string, string], soFar: string[], random: () => number = Math.random) {
  const lastTwo = soFar.slice(-2)
  if (lastTwo.length === 2 && lastTwo[0] === lastTwo[1]) return pair[0] === lastTwo[0] ? pair[1] : pair[0]
  return random() < 0.5 ? pair[0] : pair[1]
}

/**
 * Pick the next chord for a lesson.
 * The newest chord comes up about 40% of the time (it is the one being learned); among the rest,
 * chords that were missed or mixed up recently come up more. Never the same chord three times in a row.
 */
export function pickChord(
  level: number,
  soFar: string[],
  stats: Record<string, { count: number; accuracy: number }>,
  random: () => number = Math.random,
  extra: Record<string, number> = {}
): string {
  const pool = chordsForLevel(level)
  if (pool.length === 1) return pool[0]!.id
  const newest = pool[pool.length - 1]!.id
  const lastTwo = soFar.slice(-2)
  const blocked = lastTwo.length === 2 && lastTwo[0] === lastTwo[1] ? lastTwo[0] : null

  const weights = pool.map(c => {
    if (c.id === blocked) return 0
    if (c.id === newest) return Math.max(1, (pool.length - 1) * 0.67)
    const s = stats[c.id]
    const miss = s && s.count >= 3 ? 1 - s.accuracy : 0
    return 1 + miss * 2 + (extra[c.id] ?? 0)
  })
  const sum = weights.reduce((a, b) => a + b, 0)
  let r = random() * sum
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]!
    if (r < 0) return pool[i]!.id
  }
  return pool[pool.length - 1]!.id
}

/** Days (local) with at least one lesson in the week containing `now` (Mon–Sun) */
export function weekDays(lessons: Lesson[], now = new Date()) {
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const done = new Set(lessons.map(l => dayKey(l.startedAt)))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dayKey(d)
    return { key, label: '月火水木金土日'[i]!, done: done.has(key), isToday: key === dayKey(now) }
  })
}

export const lessonsOn = (lessons: Lesson[], day: string) => lessons.filter(l => dayKey(l.startedAt) === day)
