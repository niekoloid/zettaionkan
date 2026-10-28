'use client'

import { ALL_SAMPLES, type Chord } from './chords'

/**
 * Small Web Audio player: Steinway samples for the chords, recorded colour names, two effects.
 * Browsers only allow sound after a tap, so call `unlock()` from a click handler first.
 */
let ctx: AudioContext | null = null
const buffers = new Map<string, AudioBuffer>()
const pending = new Map<string, Promise<AudioBuffer | null>>()
let current: { stop: () => void } | null = null

const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  return ctx
}

export async function unlock() {
  const c = getCtx()
  if (c.state !== 'running') await c.resume()
}

function load(url: string): Promise<AudioBuffer | null> {
  const hit = buffers.get(url)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(url)
  if (!p) {
    p = fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${url}`)
        return r.arrayBuffer()
      })
      .then(data => getCtx().decodeAudioData(data))
      .then(buf => {
        buffers.set(url, buf)
        return buf
      })
      .catch(err => {
        console.error('audio load failed', err)
        pending.delete(url)
        return null
      })
    pending.set(url, p)
  }
  return p
}

const sampleUrl = (note: string) => `/samples/steinway/short/${note}.mp3`
const narrationUrl = (name: string) => `/narration/google/${encodeURIComponent(name)}.mp3`
const EFFECTS = { correct: '/audio/effects/correct.mp3' }

const lessonUrls = (chords: Chord[]) => [
  ...ALL_SAMPLES.filter(n => chords.some(c => c.samples.includes(n))).map(sampleUrl),
  ...chords.map(c => narrationUrl(c.narration)),
  EFFECTS.correct
]

/** Download (without decoding) what the next lesson needs, so starting it is quick. Safe before any tap. */
export function warm(chords: Chord[]) {
  lessonUrls(chords).forEach(url => fetch(url).catch(() => {}))
}

/** Fetch everything a lesson needs; resolves to false if any file failed */
export async function preload(chords: Chord[]) {
  const results = await Promise.all(lessonUrls(chords).map(load))
  return results.every(Boolean)
}

/** Stop whatever is sounding, so a new chord never overlaps the last one */
export function stop() {
  current?.stop()
  current = null
}

export async function playChord(chord: Chord, seconds = 2.5) {
  const c = getCtx()
  const bufs = await Promise.all(chord.samples.map(n => load(sampleUrl(n))))
  stop()
  const gain = c.createGain()
  gain.connect(c.destination)
  const t = c.currentTime + 0.02
  gain.gain.setValueAtTime(0.8, t)
  gain.gain.setValueAtTime(0.8, t + seconds)
  gain.gain.linearRampToValueAtTime(0.0001, t + seconds + 0.6)
  const sources = bufs.filter((b): b is AudioBuffer => !!b).map(b => {
    const s = c.createBufferSource()
    s.buffer = b
    s.connect(gain)
    s.start(t)
    s.stop(t + seconds + 0.7)
    return s
  })
  current = {
    stop: () => {
      const now = c.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.08)
      sources.forEach(s => {
        try {
          s.stop(now + 0.1)
        } catch {}
      })
    }
  }
  return sources.length === chord.samples.length
}

async function playBuffer(url: string, volume = 1) {
  const buf = await load(url)
  if (!buf) return 0
  const c = getCtx()
  const gain = c.createGain()
  gain.gain.value = volume
  gain.connect(c.destination)
  const s = c.createBufferSource()
  s.buffer = buf
  s.connect(gain)
  s.start()
  return buf.duration
}

/** Says the colour name ("あか") and resolves when it has finished */
export async function sayColor(chord: Chord) {
  const secs = await playBuffer(narrationUrl(chord.narration), 0.9)
  await wait(secs * 1000)
}

export async function cheer() {
  const secs = await playBuffer(EFFECTS.correct, 0.6)
  await wait(Math.min(secs, 1.2) * 1000)
}

export const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
