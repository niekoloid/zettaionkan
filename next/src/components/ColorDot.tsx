import type { Chord } from '@/lib/chords'

/** A round colour card in the chord's colour, with the colour name under it */
export default function ColorDot({ chord, size = 56, label = true }: { chord: Chord; size?: number; label?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size + 8 }}>
      <span
        aria-hidden="true"
        className="block rounded-full shadow-sm ring-1 ring-black/10"
        style={{ width: size * 0.86, height: size * 0.86, margin: size * 0.07, background: chord.color }}
      />
      {label && <span className="text-xs font-bold text-gray-700">{chord.kana}</span>}
    </div>
  )
}
