import type { MetadataRoute } from 'next'

const SITE = 'https://zettaionkan.jp'

// Same rules as the Nuxt sitemap: every public page except /auth, /account,
// /subscription, /admin, /legal, /privacy and /company.
const PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1.0 },
  { path: '/lp', priority: 0.9 },
  { path: '/about', priority: 0.8 },
  { path: '/autoplay', priority: 0.8 },
  { path: '/chordquizz', priority: 0.8 },
  { path: '/contact', priority: 0.8 },
  { path: '/faq', priority: 0.8 },
  { path: '/history', priority: 0.8 },
  { path: '/method', priority: 0.8 },
  { path: '/settings', priority: 0.8 },
  { path: '/terms', priority: 0.8 },
  { path: '/voice-settings', priority: 0.8 }
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PAGES.map(({ path, priority }) => ({ url: `${SITE}${path === '/' ? '' : path}`, lastModified, changeFrequency: 'weekly', priority }))
}
