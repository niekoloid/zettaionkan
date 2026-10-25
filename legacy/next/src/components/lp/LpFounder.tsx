'use client'

import { useEffect, useState } from 'react'
import { CtaButton, Eyebrow, Section } from './ui'

export default function LpFounder() {
  // Kept out of the static HTML so it is not picked up by search indexing
  const [devInfo, setDevInfo] = useState<{ name: string } | null>(null)
  useEffect(() => { setDevInfo({ name: '株式会社暁 代表' }) }, [])

  return (
    <Section tone="soft">
      <div className="mx-auto max-w-3xl">
        <Eyebrow tone="rose">開発者より</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black leading-tight text-gray-900">
          「間に合わなかった」という後悔を、<br className="hidden sm:block" />誰にもしてほしくない。
        </h2>

        <div className="mt-8 space-y-5 text-sm sm:text-base leading-relaxed text-gray-700">
          <p>はじめまして。いろおとの開発者です。</p>
          <p>
            私自身、15歳のときにピアノの演奏にのめり込んでいた際、「自分にも絶対音感があったら」と切実に思っていました。しかし、皮肉にも絶対音感が欲しいと願うのは、もうそれが手に入らない大人になってからなのです。6歳ごろまでの子どもたちは、まだ臨界期の存在すら知らず、自らそれを望むことはありません。
          </p>
          <p>
            親として「良いと言われることはしてあげたい」。その一心で2歳の息子と音感トレーニングに格闘しましたが、現実は甘くありませんでした。様々な研究資料をあたると「和音と色を結びつける方法」が最適であることは分かりましたが、いざ家庭で毎日実践しようとすると、それはあまりにも大変なことでした。教具を揃え、ピアノの前に誘い、なんとか子どもを飽きさせないように…。気づけば余裕をなくし、「やりなさい！」と声を荒らげてしまう日々。
          </p>
          <p className="font-bold text-gray-900">「これでは本末転倒だ…」</p>
          <p>そんな挫折と反省から、この「いろおと」は生まれました。</p>
          <p>
            子どもが自ら「やりたい！」と駆け寄ってくれる。親は隣でニコニコと見守るだけでいい。そんな幸せな景色を作りたくて、徹底的に「子どもの視点」で遊びの要素を詰め込みました。
          </p>
          <p>
            絶対音感の習得にはタイムリミットがありますが、焦る必要はありません。正しい方法さえあれば、それはトレーニングの時間ではなく、親子の笑顔の時間になるからです。
          </p>
          <p>あなたと、大切なお子さまの未来が、色とりどりの音で溢れますように。</p>
        </div>

        {/* googleoff: index */}
        {devInfo && <p className="mt-6 text-sm font-bold text-gray-500">{devInfo.name}</p>}
        {/* googleon: index */}

        <div className="mt-10">
          <CtaButton>無料で始める</CtaButton>
        </div>
      </div>
    </Section>
  )
}
