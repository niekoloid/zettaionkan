'use client'

import type { FrequencyChord } from '@/lib/chord-frequency'

interface Props {
  parentChordRatio: number
  onParentChordRatioChange: (v: number) => void
  isReviewWeighted: boolean
  onReviewWeightedChange: (v: boolean) => void
  parentChord: FrequencyChord | null
  otherChords: FrequencyChord[]
  otherChordsDisplay: string
  otherChordsWithWeights: (FrequencyChord & { weight: number })[]
  selectedCount: number
}

export default function FrequencySettings({
  parentChordRatio, onParentChordRatioChange, isReviewWeighted, onReviewWeightedChange,
  parentChord, otherChords, otherChordsDisplay, otherChordsWithWeights, selectedCount
}: Props) {
  if (selectedCount <= 1) return null

  return (
    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-5">
      <div>
        <p className="text-sm font-black text-gray-900">出現割合の調整</p>
        <p className="text-[10px] font-bold text-gray-400 mt-0.5">新しい和音と復習の和音のバランス</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: parentChord?.color }} />
              <span className="text-[10px] font-black text-gray-700">新音: {parentChord?.displayColor}</span>
            </div>
            <span className="text-xl font-black text-gray-900">{Math.round(parentChordRatio * 10)}</span>
          </div>
          <div className="text-gray-300 font-black text-xl">:</div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-black text-gray-700">復習: {otherChordsDisplay}</span>
              <div className="flex -space-x-1">
                {otherChords.slice(0, 3).map(c => (
                  <span key={c.id} className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: c.color }} />
                ))}
              </div>
            </div>
            <span className="text-xl font-black text-gray-900">{10 - Math.round(parentChordRatio * 10)}</span>
          </div>
        </div>

        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner border border-gray-100">
          <div className="h-full transition-all duration-500 ease-out relative" style={{ width: `${parentChordRatio * 100}%`, backgroundColor: parentChord?.color }}>
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
          <div className="h-full flex" style={{ width: `${(1 - parentChordRatio) * 100}%` }}>
            {otherChordsWithWeights.map(c => (
              <div key={c.id} className="h-full transition-all duration-500 shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]" style={{ width: `${c.weight * 100}%`, backgroundColor: c.color }} />
            ))}
          </div>
        </div>
      </div>

      <input
        type="range" min={0.1} max={0.5} step={0.1}
        value={parentChordRatio}
        onChange={e => onParentChordRatioChange(parseFloat(e.target.value))}
        aria-label="新音の出現割合"
        className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600 transition-all hover:bg-gray-300"
      />

      <div className="flex justify-between px-1">
        {[['新音控えめ', '1 : 9'], ['バランス重視', '3 : 7'], ['新音たっぷり', '5 : 5']].map(([label, ratio]) => (
          <div key={label} className="text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
            <p className="text-[8px] font-bold text-gray-300 mt-0.5">{ratio}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isReviewWeighted}
        onClick={() => onReviewWeightedChange(!isReviewWeighted)}
        className="w-full text-left pt-5 border-t border-gray-100 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="pr-6">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-colors ${isReviewWeighted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>⚖️</div>
            <p className="text-[12px] font-black text-gray-800">復習の重み付け</p>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-1.5 leading-relaxed">Lv1に近い基礎の音をより多く、新音に近い音を少なめに出題（おすすめ）</p>
        </div>
        <div className={`w-12 h-7 rounded-full transition-all duration-300 relative shrink-0 shadow-inner ${isReviewWeighted ? 'bg-indigo-600' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md flex items-center justify-center ${isReviewWeighted ? 'translate-x-5' : ''}`}>
            {isReviewWeighted && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />}
          </div>
        </div>
      </button>
    </div>
  )
}
