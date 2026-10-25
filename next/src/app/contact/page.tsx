import type { Metadata } from 'next'
import Doc from '@/components/Doc'

export const metadata: Metadata = { title: 'お問い合わせ' }

export default function ContactPage() {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
  return (
    <Doc title="お問い合わせ">
      <p>ご質問やご要望、記録の削除のご依頼などはこちらからどうぞ。</p>
      {endpoint ? (
        <form action={endpoint} method="POST" className="space-y-4">
          <input className="field" name="name" required placeholder="おなまえ" />
          <input className="field" name="email" type="email" required placeholder="メールアドレス" />
          <textarea className="field resize-none" name="message" required rows={6} placeholder="お問い合わせ内容" />
          <button className="btn-primary w-full">送信する</button>
        </form>
      ) : (
        <p className="text-gray-500">ただいまフォームを準備中です。</p>
      )}
    </Doc>
  )
}
