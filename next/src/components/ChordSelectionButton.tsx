'use client'

import type { Chord } from '@/constants/chords'
import { isLightColor } from '@/lib/chords'
import { useAppSettings } from '@/lib/app-context'

interface Props {
  chord: Chord
  selected?: boolean
  locked?: boolean
  onToggle: () => void
  onLockedClick: () => void
}

export default function ChordSelectionButton({ chord, selected = false, locked = false, onToggle, onLockedClick }: Props) {
  const { formatChordName, formatColorName } = useAppSettings()
  const light = isLightColor(chord.color)

  return (
    <button
      type="button"
      onClick={locked ? onLockedClick : onToggle}
      aria-pressed={selected}
      className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.98] text-left ${selected ? 'shadow-lg bg-white border-gray-200' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white'}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300" style={{ backgroundColor: selected ? chord.color : 'transparent', opacity: selected ? 1 : 0 }} />

      <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 text-[11px] font-black shadow-sm" style={{ backgroundColor: chord.color, color: light ? '#000' : '#fff' }}>
        {chord.sortOrder}
      </div>

      <div className="flex flex-col items-start overflow-hidden min-w-0">
        <span className="font-bold text-gray-900 text-[15px] leading-tight truncate w-full">{formatChordName(chord)}</span>
        <span className="text-[10px] font-medium text-gray-400 shrink-0 truncate w-full">{formatColorName(chord.displayColor || '')}</span>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: light ? '#111827' : chord.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="bg-white/90 p-1.5 rounded-full shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="PRO限定">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      )}
    </button>
  )
}
