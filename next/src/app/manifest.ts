import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'いろおと',
    short_name: 'いろおと',
    description: '1日30秒×4回の絶対音感トレーニング',
    start_url: '/today',
    display: 'standalone',
    background_color: '#fffaf3',
    theme_color: '#fffaf3',
    icons: [
      { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
