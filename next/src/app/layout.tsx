import type { Metadata, Viewport } from 'next'
import { AccountProvider } from '@/lib/account'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://zettaionkan.jp'),
  title: { default: 'いろおと - 1日30秒×4回の絶対音感トレーニング', template: '%s | いろおと' },
  description:
    '和音を聞いて、色にタッチするだけ。1回30秒、1日4回。3歳から続けられる、親子のための絶対音感トレーニングアプリです。',
  openGraph: { images: '/ogp_image.png', siteName: 'いろおと', locale: 'ja_JP', type: 'website' },
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'いろおと', statusBarStyle: 'default' },
  manifest: '/manifest.webmanifest'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fffaf3'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="/fonts/noto-sans-jp.css" />
        {/* Vercel Web Analytics (page views, no cookies); served by Vercel, missing locally */}
        <script defer src="/_vercel/insights/script.js" />
      </head>
      <body>
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  )
}
