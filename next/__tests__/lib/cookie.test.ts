import { decodeCookie, readCookie, writeCookie } from '@/lib/cookie'

describe('cookie helpers (Nuxt useCookie compatible)', () => {
  beforeEach(() => {
    document.cookie.split('; ').forEach(c => { document.cookie = `${c.split('=')[0]}=; max-age=0; path=/` })
  })

  it('decodes JSON, raw strings and falls back', () => {
    expect(decodeCookie(encodeURIComponent('{"a":1}'), {})).toEqual({ a: 1 })
    expect(decodeCookie('premium', 'free')).toBe('premium')
    expect(decodeCookie(undefined, 'free')).toBe('free')
    expect(decodeCookie('', 5)).toBe(5)
    expect(decodeCookie('100%', 'x')).toBe('100%') // malformed URI is returned as-is
  })

  it('round-trips objects and keeps strings raw', () => {
    writeCookie('obj', { x: [1, 2], y: 'あ' })
    writeCookie('tier', 'standard')
    expect(readCookie('obj', null)).toEqual({ x: [1, 2], y: 'あ' })
    expect(readCookie('tier', 'free')).toBe('standard')
    expect(document.cookie).toContain('tier=standard') // raw, not JSON-quoted
    expect(readCookie('missing', 'fallback')).toBe('fallback')
  })
})
