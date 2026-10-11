import type { Metadata } from 'next'
import LpPage from '@/components/lp/LpPage'

const title = '絶対音感を、色でおぼえる。 | いろおと'
const description = '14種類の和音を14の色と結びつけて、遊びながら耳を育てる2〜6歳向けの絶対音感トレーニング。本物のグランドピアノの音を、スマホひとつで。14日間無料。'
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
