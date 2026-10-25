import type { Chord } from '@/lib/chords'

/** A small pennant in the chord's colour, with the colour name under it */
export default function Flag({ chord, size = 56, label = true }: { chord: Chord; size?: number; label?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size + 8 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="4" width="4" height="58" rx="2" fill="#9CA3AF" />
        <path d="M12 6 H58 L50 21 L58 36 H12 Z" fill={chord.color} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
      </svg>
      {label && <span className="text-xs font-bold text-gray-700">{chord.kana}</span>}
    </div>
  )
}
