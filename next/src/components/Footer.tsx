import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="no-print px-6 py-10 text-center text-xs text-gray-400">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link href="/plans">料金プラン</Link>
        <Link href="/terms">利用規約</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/legal">特定商取引法に基づく表記</Link>
        <Link href="/contact">お問い合わせ</Link>
      </nav>
      <p>&copy; 2026 Akatsuki Inc.</p>
    </footer>
  )
}
