'use client'

import abcjs from 'abcjs'
import { useEffect, useId, type ReactNode } from 'react'

interface Props {
  abc?: string
  isAnswered?: boolean
  placeholderText?: string
  placeholderSubtext?: string
  clef?: 'treble' | 'bass'
  compact?: boolean
  scale?: number
  footer?: ReactNode
}

export default function ScoreDisplay({
  abc = '',
  isAnswered = true,
  placeholderText = '?',
  placeholderSubtext = '聴き取り中...',
  clef = 'treble',
  compact = false,
  scale = 1,
  footer
}: Props) {
  const elementId = `score-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (!isAnswered) return
    // Chord symbols are not shown on the home page
    const cleanAbc = (abc || 'y').replace(/"[^"]*"/g, '')
      abcjs.renderAbc(elementId, `L:1\nK:C ${clef === 'bass' ? 'clef=bass' : ''}\n${cleanAbc}`, {
        responsive: undefined,
        scale: scale * (compact ? 0.7 : 1),
        paddingtop: compact ? 0 : 15,
        paddingbottom: compact ? 0 : 15,
        paddingleft: 0,
        paddingright: 0,
        staffwidth: compact ? 50 : 70,
        add_classes: false
      })
  }, [abc, isAnswered, clef, compact, scale, elementId])

  return (
    <div
      className={`flex flex-col items-center justify-center overflow-hidden relative ${
        compact ? 'w-20 h-16 bg-gray-50/50 rounded-xl' : 'w-[155px] h-[180px] bg-white rounded-3xl p-4 shadow-sm border border-gray-100'
      }`}
    >
      {!isAnswered && (
        <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2 border border-gray-100">
            <span className="text-xl font-black text-indigo-500">{placeholderText}</span>
          </div>
          {placeholderSubtext && (
            <span className="text-[7px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">{placeholderSubtext}</span>
          )}
        </div>
      )}

      <div
        id={elementId}
        className={`w-full flex justify-center items-center pointer-events-none animate-bounce-in ${compact ? '' : 'scale-125'}`}
        style={{ display: isAnswered ? undefined : 'none' }}
      />

      {!compact && footer}
    </div>
  )
}
