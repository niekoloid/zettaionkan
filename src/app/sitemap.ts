import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://zettaionkan.jp'
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/plans`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/flags`, changeFrequency: 'monthly', priority: 0.5 }
  ]
}
