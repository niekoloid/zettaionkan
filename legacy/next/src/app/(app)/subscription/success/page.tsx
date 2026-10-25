'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  // go back to the home screen after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => router.push('/'), 5000)
    return () => clearTimeout(t)
  }, [router])

  return (
<div className="min-h-screen bg-white"><div className="min-h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden items-center justify-center px-8 text-center"><div className="mb-8 bg-green-50 p-6 rounded-full"><svg className="h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div><h1 className="text-2xl font-bold text-gray-900 mb-4">Proプランへの登録が<br />完了しました！</h1><p className="text-sm text-gray-500 leading-relaxed mb-8">ご利用ありがとうございます。<br />全ての機能をお楽しみいただけます。</p><div className="space-y-4 w-full"><Link className="block w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all" href="/">トレーニングに戻る</Link><p className="text-[10px] text-gray-400">5秒後に自動的にホーム画面に戻ります</p></div></div></div>
  )
}
