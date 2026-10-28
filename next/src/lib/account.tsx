'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'
import { getState, setState } from './store'
import type { Lesson } from './engine'
import { maxLevelFor, type Tier } from './plans'

interface AccountValue {
  ready: boolean
  /** The signed-in account; null for the automatic anonymous session */
  user: User | null
  tier: Tier
  unlimited: boolean
  maxLevel: number
  signOut: () => Promise<void>
  /** Push local changes to the account (starts an anonymous session when there is none) */
  sync: () => void
}

const Ctx = createContext<AccountValue | null>(null)

interface ChildRow {
  user_id: string
  nickname: string
  times: string[]
  questions_per_lesson: number
  level: number
  level_changed_at: string
}

interface LessonRow {
  id: string
  user_id: string
  started_at: string
  finished_at: string
  level: number
  answers: Lesson['answers']
  focus: [string, string] | null
}

/**
 * Lessons already saved under another user (e.g. the anonymous session before signing in)
 * get fresh ids, so they can be saved again under this one.
 */
function adopt(userId: string) {
  setState(s => {
    if (s.syncedFor === userId) return {}
    if (!s.syncedFor) return { syncedFor: userId }
    const done = new Set(s.synced)
    return {
      syncedFor: userId,
      synced: [],
      lessons: s.lessons.map(l => (done.has(l.id) ? { ...l, id: crypto.randomUUID() } : l))
    }
  })
}

async function pull(userId: string) {
  const sb = getSupabase()!
  const [{ data: child }, { data: rows }] = await Promise.all([
    sb.from('children').select('*').eq('user_id', userId).maybeSingle<ChildRow>(),
    sb.from('lessons').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(1000)
  ])
  setState(s => {
    const known = new Set(s.lessons.map(l => l.id))
    const remote = ((rows ?? []) as LessonRow[]).map(r => ({
      id: r.id,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      level: r.level,
      answers: r.answers,
      ...(r.focus ? { focus: r.focus } : {})
    }))
    const lessons = [...s.lessons, ...remote.filter(l => !known.has(l.id))].sort((a, b) =>
      a.startedAt.localeCompare(b.startedAt)
    )
    const patch: Partial<typeof s> = { lessons, synced: Array.from(new Set([...s.synced, ...remote.map(l => l.id)])) }
    if (child) {
      if (!s.nickname) {
        patch.nickname = child.nickname
        patch.times = child.times
        patch.questionsPerLesson = child.questions_per_lesson
      }
      if (child.level > s.level) {
        patch.level = child.level
        patch.levelChangedAt = child.level_changed_at
      }
    }
    return patch
  })
}

async function push(userId: string) {
  const sb = getSupabase()!
  const s = getState()
  if (s.nickname) {
    const { error } = await sb.from('children').upsert({
      user_id: userId,
      nickname: s.nickname,
      times: s.times,
      questions_per_lesson: s.questionsPerLesson,
      level: s.level,
      level_changed_at: s.levelChangedAt,
      updated_at: new Date().toISOString()
    })
    if (error) console.error('child sync failed', error)
  }
  const synced = new Set(s.synced)
  const fresh = s.lessons.filter(l => !synced.has(l.id))
  if (fresh.length) {
    const { error } = await sb.from('lessons').upsert(
      fresh.map(l => ({
        id: l.id,
        user_id: userId,
        started_at: l.startedAt,
        finished_at: l.finishedAt,
        level: l.level,
        answers: l.answers,
        focus: l.focus ?? null,
        correct: l.answers.filter(a => a.correct).length,
        total: l.answers.length
      }))
    )
    if (error) console.error('lesson sync failed', error)
    else setState(st => ({ synced: Array.from(new Set([...st.synced, ...fresh.map(l => l.id)])) }))
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [tier, setTier] = useState<Tier>('free')
  const [unlimited, setUnlimited] = useState(false)
  const userId = session?.user.id ?? null
  const userRef = useRef<string | null>(null)
  userRef.current = userId
  const anonPending = useRef(false)

  /**
   * Every family that has finished setup gets an anonymous session, so lessons are saved
   * (and counted) without asking anyone to register. Fails quietly when anonymous sign-ins are off.
   */
  const ensureSession = useCallback(async () => {
    const sb = getSupabase()
    if (!sb || userRef.current || anonPending.current || !getState().nickname) return
    anonPending.current = true
    try {
      const { data } = await sb.auth.getSession()
      if (data.session) return
      const { error } = await sb.auth.signInAnonymously()
      if (error) console.warn('anonymous sign-in unavailable', error.message)
    } finally {
      anonPending.current = false
    }
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) {
      setReady(true)
      return
    }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) {
        setReady(true)
        ensureSession()
      }
    })
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [ensureSession])

  useEffect(() => {
    if (!userId) {
      setTier('free')
      setUnlimited(false)
      return
    }
    const sb = getSupabase()!
    let cancelled = false
    ;(async () => {
      const { data } = await sb.from('profiles').select('subscription_tier, is_unlimited').eq('id', userId).maybeSingle()
      if (cancelled) return
      setTier((data?.subscription_tier as Tier) ?? 'free')
      setUnlimited(!!data?.is_unlimited)
      setReady(true)
      try {
        adopt(userId)
        await pull(userId)
        await push(userId)
      } catch (err) {
        console.error('sync failed', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const sync = useCallback(() => {
    const id = userRef.current
    if (id) push(id).catch(err => console.error('sync failed', err))
    else ensureSession()
  }, [ensureSession])

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut()
  }, [])

  const value = useMemo<AccountValue>(
    () => ({
      ready,
      user: session && !session.user.is_anonymous ? session.user : null,
      tier,
      unlimited,
      maxLevel: maxLevelFor(tier, unlimited),
      signOut,
      sync
    }),
    [ready, session, tier, unlimited, signOut, sync]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAccount() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AccountProvider is missing')
  return v
}
