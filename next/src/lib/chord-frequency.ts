'use client'

import { useCallback, useMemo, useState } from 'react'

export interface FrequencyChord {
  id: string
  color: string
  displayColor?: string
  sortOrder?: number
}

/**
 * "New chord" (highest level) vs "review chords" picker used by the quiz.
 * parentChord = the most advanced selected chord; the rest are review chords.
 */
export function useChordFrequency<T extends FrequencyChord>(selectedChords: T[], initial?: { ratio?: number; weighted?: boolean }) {
  const [parentChordRatio, setParentChordRatio] = useState(initial?.ratio ?? 0.3)
  const [isReviewWeighted, setIsReviewWeighted] = useState(initial?.weighted ?? false)

  const parentChord = useMemo<T | null>(() => {
    if (selectedChords.length === 0) return null
    return selectedChords.reduce((prev, cur) => ((prev.sortOrder ?? 0) > (cur.sortOrder ?? 0) ? prev : cur))
  }, [selectedChords])

  const otherChords = useMemo(
    () => (parentChord ? selectedChords.filter(c => c.id !== parentChord.id) : []),
    [selectedChords, parentChord]
  )

  const otherChordsDisplay = useMemo(() => {
    if (otherChords.length === 0) return ''
    const names = otherChords.slice(0, 3).map(c => c.displayColor).join('・')
    return otherChords.length <= 3 ? names : `${names}など`
  }, [otherChords])

  const otherChordsWithWeights = useMemo(() => {
    if (!parentChord || otherChords.length === 0) return []
    if (!isReviewWeighted || otherChords.length <= 1) {
      return otherChords.map(c => ({ ...c, weight: 1 / otherChords.length }))
    }
    const weights = otherChords.map(c => (parentChord.sortOrder ?? 0) - (c.sortOrder ?? 0))
    const total = weights.reduce((a, b) => a + b, 0)
    return otherChords.map((c, i) => ({ ...c, weight: weights[i]! / total }))
  }, [parentChord, otherChords, isReviewWeighted])

  const getRandomChord = useCallback((): T | null => {
    if (selectedChords.length === 0) return null
    if (selectedChords.length === 1) return selectedChords[0]!
    if (Math.random() < parentChordRatio) return parentChord

    if (!isReviewWeighted || otherChords.length <= 1) {
      return otherChords[Math.floor(Math.random() * otherChords.length)]!
    }
    const weights = otherChords.map(c => (parentChord!.sortOrder ?? 0) - (c.sortOrder ?? 0))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    for (let i = 0; i < otherChords.length; i++) {
      if (r < weights[i]!) return otherChords[i]!
      r -= weights[i]!
    }
    return otherChords[otherChords.length - 1]!
  }, [selectedChords, parentChord, otherChords, parentChordRatio, isReviewWeighted])

  return {
    parentChordRatio, setParentChordRatio,
    isReviewWeighted, setIsReviewWeighted,
    parentChord, otherChords, otherChordsDisplay, otherChordsWithWeights, getRandomChord
  }
}
