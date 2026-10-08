// Share ../public (audio, images, samples) with the Nuxt app by copying it into
// ./public before dev/build. A copy (instead of a symlink) also works on Vercel.
import { cpSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(new URL('../../public', import.meta.url))
const dest = fileURLToPath(new URL('../public', import.meta.url))

if (!existsSync(src)) {
  if (!existsSync(dest)) {
    console.error('sync-public: ../public not found. Make sure the whole repository is available to the build.')
    process.exit(1)
  }
  console.warn('sync-public: ../public not found, using existing ./public')
} else {
  cpSync(src, dest, { recursive: true, force: true })
  console.log('sync-public: copied ../public -> ./public')
}
