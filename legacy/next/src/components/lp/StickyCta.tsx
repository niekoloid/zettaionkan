import Link from 'next/link'
import { SIGNUP_HREF } from './ui'

/** Mobile-only bar pinned to the bottom. The page adds bottom padding so nothing hides under it. */
export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Link
        href={SIGNUP_HREF}
        className="flex h-12 items-center justify-center rounded-full bg-gray-900 text-base font-bold text-white shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
      >
        今すぐ無料で始める
      </Link>
    </div>
  )
}
