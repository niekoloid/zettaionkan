// Cookie helpers compatible with Nuxt's useCookie encoding, so existing users
// keep their settings when moving between the two apps:
//   strings are stored raw, everything else as JSON (both URI-encoded).

export const ONE_YEAR = 60 * 60 * 24 * 365
export const HUNDRED_YEARS = ONE_YEAR * 100

export function decodeCookie<T>(raw: string | undefined | null, fallback: T): T {
  if (raw === undefined || raw === null || raw === '') return fallback
  let text = raw
  try {
    text = decodeURIComponent(raw)
  } catch {
    // already decoded (e.g. by next/headers)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

export function readCookie<T>(name: string, fallback: T): T {
  if (typeof document === 'undefined') return fallback
  const hit = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
  return decodeCookie(hit?.slice(name.length + 1), fallback)
}

export function writeCookie(name: string, value: unknown, maxAge = ONE_YEAR) {
  if (typeof document === 'undefined') return
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  document.cookie = `${name}=${encodeURIComponent(text)}; path=/; max-age=${maxAge}; SameSite=Lax`
}
