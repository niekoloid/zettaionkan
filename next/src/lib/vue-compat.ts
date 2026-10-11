import { useMemo } from 'react'

type ClassValue = string | number | false | null | undefined | ClassValue[] | Record<string, unknown>

/** Vue-style class binding: strings, arrays and { class: condition } objects. */
export function vcls(...values: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return
    if (typeof v === 'string' || typeof v === 'number') out.push(String(v))
    else if (Array.isArray(v)) v.forEach(walk)
    else if (typeof v === 'object') for (const [k, on] of Object.entries(v)) if (on) out.push(k)
  }
  values.forEach(walk)
  return out.join(' ')
}

/** Vue-style v-for over arrays or a number (1..n). */
export function vfor<T, R>(source: T[] | null | undefined, render: (item: T, index: number) => R): R[]
export function vfor<R>(source: number, render: (item: number, index: number) => R): R[]
export function vfor(source: unknown, render: (item: any, index: number) => unknown): unknown[] {
  if (source == null) return []
  if (typeof source === 'number') return Array.from({ length: source }, (_, i) => render(i + 1, i))
  return (source as unknown[]).map(render)
}

/** Random numbers that stay stable across re-renders until `resetKey` changes. */
export function useStableRandom(resetKey: unknown = 0) {
  return useMemo(() => {
    const cache = new Map<string, number>()
    return (a: number | string, b: number) => {
      const k = `${a}:${b}`
      let v = cache.get(k)
      if (v === undefined) { v = Math.random(); cache.set(k, v) }
      return v
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])
}
