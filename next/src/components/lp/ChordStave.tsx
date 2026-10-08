'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import abcjs from 'abcjs'
import type { Chord } from '@/constants/chords'
import './lp.css'

export default function ChordStave({ chords }: { chords: Chord[] }) {
  const elementId = 'chord-stave-canvas'
  const [error, setError] = useState<string | null>(null)

  // Build the ABC string: one chord per quarter note, with chord name + colour name as lyrics
  const generateAbc = (list: Chord[]) => {
    const header = `
X:1
M:none
L:1/4
K:C treble
%%staffwidth 1600
%%gchordfont 12
`
    let notesLine = ''
    let wLine1 = 'w:'
    let wLine2 = 'w:'
    list.forEach(chord => {
      notesLine += `${chord.abc} `
      wLine1 += ` ${chord.nameIt ? chord.nameIt.replace(/\s/g, '_') : '_'}`
      wLine2 += ` ${chord.colorName ? chord.colorName.replace(/\s/g, '_') : '_'}`
    })
    return `${header}\n${notesLine}\n${wLine1}\n${wLine2}`
  }

  useEffect(() => {
    setError(null)
    try {
      const visualObj = abcjs.renderAbc(elementId, generateAbc(chords), {
        add_classes: true, paddingtop: 30, paddingbottom: 50, paddingright: 30, paddingleft: 30, staffwidth: 1800, scale: 1.3
      })
      const tunes = visualObj as unknown as unknown[] | undefined
      if ((!tunes || tunes.length === 0) && !document.getElementById(elementId)) setError(`Element #${elementId} not found`)
    } catch (e: any) {
      console.error('abcjs render error:', e)
      setError(e.message)
    }
  }, [chords])

  return (
<div className="chord-stave w-full overflow-x-auto custom-scrollbar"><div className="min-w-[800px] bg-white text-left pl-4" id={elementId} />{(error) ? (<div className="text-red-500 text-sm mt-2">Error: {error}</div>) : null}</div>
  )
}
