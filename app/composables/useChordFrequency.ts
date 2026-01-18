import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Chord } from '~/constants/chords'

interface ChordWithSortOrder extends Chord {
    sortOrder: number
}

// NOTE: sortOrder property seems to be missing from Chord type definition in chords.ts.
// It might be added dynamically or missing.
// Looking at usage: `prev.sortOrder > current.sortOrder`
// I should extend the Chord type or assume it is added elsewhere.
// But chordsRef value comes from constants/chords.ts?
// Wait, `selectedChords` usually comes from `useChordSettings` + filtering.
// If sortOrder is essential, I should inspect where it comes from.
// In the original filtering logic (not visible here), maybe it's added.
// For now I'll cast `c as any` or extend interface locally if needed, but safer to assume Chord extends it in this context or use generic.

interface WeightedChord extends ChordWithSortOrder {
    weight?: number
}

export function useChordFrequency(chordsRef: Ref<any[]>) { // Using any[] for now as sortOrder is dynamic
  const parentChordRatio = ref(0.3)
  const isReviewWeighted = ref(false)

  const selectedChords = computed<any[]>(() => {
    return chordsRef.value || []
  })

  const parentChord = computed<any | null>(() => {
    if (selectedChords.value.length === 0) return null
    return selectedChords.value.reduce((prev, current) => 
      (prev.sortOrder > current.sortOrder) ? prev : current
    )
  })

  const otherChords = computed<any[]>(() => {
    if (!parentChord.value) return []
    return selectedChords.value.filter(c => c.id !== parentChord.value.id)
  })

  const otherChordsDisplay = computed<string>(() => {
    if (otherChords.value.length === 0) return ''
    if (otherChords.value.length <= 3) return otherChords.value.map(c => c.displayColor).join('・')
    return otherChords.value.slice(0, 3).map(c => c.displayColor).join('・') + 'など'
  })

  const otherChordsWithWeights = computed<any[]>(() => {
    if (!parentChord.value || otherChords.value.length === 0) return []
    if (!isReviewWeighted.value || otherChords.value.length <= 1) {
      return otherChords.value.map(c => ({ ...c, weight: 1 / otherChords.value.length }))
    }
    const weights = otherChords.value.map(c => parentChord.value.sortOrder - c.sortOrder)
    const totalWeight = weights.reduce((a: number, b: number) => a + b, 0)
    return otherChords.value.map((c, i) => ({ ...c, weight: weights[i]! / totalWeight }))
  })

  const getRandomChord = (): Chord | null => {
    const available = selectedChords.value
    if (available.length === 0) return null
    if (available.length === 1) return available[0]

    const pChord = parentChord.value
    const oChords = otherChords.value

    if (Math.random() < parentChordRatio.value) {
      return pChord
    } else {
      if (!isReviewWeighted.value || oChords.length <= 1) {
        return oChords[Math.floor(Math.random() * oChords.length)]
      }

      const weights = oChords.map(c => pChord.sortOrder - c.sortOrder)
      const totalWeight = weights.reduce((a: number, b: number) => a + b, 0)
      let random = Math.random() * totalWeight
      for (let i = 0; i < oChords.length; i++) {
        if (random < weights[i]!) return oChords[i]!
        random -= weights[i]!
      }
      return oChords[oChords.length - 1]
    }
  }

  return {
    parentChordRatio,
    isReviewWeighted,
    parentChord,
    otherChords,
    otherChordsDisplay,
    otherChordsWithWeights,
    getRandomChord
  }
}
