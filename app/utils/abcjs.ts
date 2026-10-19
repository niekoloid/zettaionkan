import type abcjsType from 'abcjs'

// abcjs is ~500KB. Load it on demand so pages that show a staff can hydrate
// (and respond to taps) without waiting for it.
let abcjsPromise: Promise<typeof abcjsType> | null = null

export const loadAbcjs = () => {
  if (!abcjsPromise) {
    abcjsPromise = import('abcjs').then(m => m.default)
    abcjsPromise.catch(() => { abcjsPromise = null })
  }
  return abcjsPromise
}
