'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function StickyCta() {
  return (
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden"><div className="flex flex-col items-center"><a className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-center py-4 rounded-full shadow-lg text-lg animate-pulse" href="/auth?mode=signup">今すぐ無料で始める</a></div></div>
  )
}
