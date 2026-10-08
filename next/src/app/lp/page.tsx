import type { Metadata } from 'next'
import LpPage from '@/components/lp/LpPage'

const title = '絶対音感の習得を、もっと簡単に。 | いろおと'
const description = 'こどもの耳の『黄金期』を逃さない。再現性の高い科学的メソッドで、スマホひとつで身につく絶対音感トレーニング。'
const image = 'https://zettaionkan.jp/images/lp/ogp_image.webp'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [image], url: 'https://zettaionkan.jp/', type: 'website', siteName: 'いろおと' },
  twitter: { card: 'summary_large_image', title, description, images: [image] }
}

export default function Page() {
  return <LpPage />
}
