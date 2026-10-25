'use client'

import { useSyncExternalStore } from 'react'
import type { Lesson } from './engine'

/** Everything the app needs works from this local state; a signed-in account also syncs it. */
export interface AppState {
  nickname: string
  /** Four reminder times, HH:MM */
  times: string[]
  questionsPerLesson: number
  level: number
  levelChangedAt: string
  lessons: Lesson[]
  /** Lesson ids already saved to the account */
  synced: string[]
}

const KEY = 'irooto.v2'
const MAX_LESSONS = 1000

export const DEFAULT_TIMES = ['07:30', '17:30', '19:00', '20:30']

export const initialState = (): AppState => ({
  nickname: '',
  times: DEFAULT_TIMES,
  questionsPerLesson: 15,
  level: 1,
  levelChangedAt: new Date().toISOString(),
  lessons: [],
  synced: []
})

let state: AppState | null = null
const listeners = new Set<() => void>()

function read(): AppState {
  if (state) return state
  if (typeof window === 'undefined') return initialState()
  try {
    const raw = window.localStorage.getItem(KEY)
    state = raw ? { ...initialState(), ...JSON.parse(raw) } : initialState()
  } catch {
    state = initialState()
  }
  return state!
}

export function getState() {
  return read()
}

export function setState(update: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const current = read()
  const patch = typeof update === 'function' ? update(current) : update
  state = { ...current, ...patch }
  if (state.lessons.length > MAX_LESSONS) state.lessons = state.lessons.slice(-MAX_LESSONS)
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked: keep working in memory
  }
  listeners.forEach(l => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

const serverSnapshot = initialState()

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, read, () => serverSnapshot)
}

/** True once the browser state has been read (avoids redirect flicker on first render) */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function addLesson(lesson: Lesson) {
  setState(s => ({ lessons: [...s.lessons, lesson] }))
}

export function changeLevel(level: number) {
  setState({ level, levelChangedAt: new Date().toISOString() })
}

export function resetAll() {
  state = initialState()
  try {
    window.localStorage.removeItem(KEY)
  } catch {}
  listeners.forEach(l => l())
}
