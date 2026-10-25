import type { Metadata } from 'next'
import Doc from '@/components/Doc'

export const metadata: Metadata = { title: 'プライバシーポリシー', robots: { index: false } }

export default function PrivacyPage() {
  return (
    <Doc title="プライバシーポリシー" updated="2026年10月25日">
      <section>
        <h2 className="font-bold text-gray-900">取得する情報</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>メールアドレス、Google等のログイン情報（ログインした場合）</li>
          <li>お子さんの呼び名（ニックネーム）、レッスンの時刻、レッスンの正誤記録と進み具合</li>
          <li>決済に関する情報（Stripeが処理し、当社はカード情報を保存しません）</li>
          <li>端末やブラウザの種類などの技術情報</li>
        </ul>
        <p className="mt-2">
          ログインしない場合、レッスンの記録はお使いの端末の中だけに保存され、当社には送信されません。お子さんの本名や生年月日は取得しません。
        </p>
      </section>
      <section>
        <h2 className="font-bold text-gray-900">利用目的</h2>
        <p className="mt-1">ログインと本人確認、記録の保存と端末間の同期、有料プランの管理と決済、お問い合わせへの対応、サービスの改善のために利用します。</p>
      </section>
      <section>
        <h2 className="font-bold text-gray-900">第三者への提供</h2>
        <p className="mt-1">
          法令に基づく場合を除き、同意なく第三者に提供しません。ただし、決済（Stripe）やデータ保管（Supabase）などの委託先には、サービスの運営に必要な範囲で情報を預けます。
        </p>
      </section>
      <section>
        <h2 className="font-bold text-gray-900">削除と変更</h2>
        <p className="mt-1">記録やアカウントの削除をご希望の場合は、お問い合わせフォームからご連絡ください。本ポリシーを変更する場合は、本サービス上でお知らせします。</p>
      </section>
    </Doc>
  )
}
