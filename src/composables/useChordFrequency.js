import { ref, computed } from 'vue'

export function useChordFrequency(chordsRef) {
  const parentChordRatio = ref(0.3)
  const isReviewWeighted = ref(false)

  const selectedChords = computed(() => {
    return chordsRef.value || []
  })

  const parentChord = computed(() => {
    if (selectedChords.value.length === 0) return null
    return selectedChords.value.reduce((prev, current) => 
      (prev.sortOrder > current.sortOrder) ? prev : current
    )
  })

  const otherChords = computed(() => {
    if (!parentChord.value) return []
    return selectedChords.value.filter(c => c.id !== parentChord.value.id)
  })

  const otherChordsDisplay = computed(() => {
    if (otherChords.value.length === 0) return ''
    if (otherChords.value.length <= 3) return otherChords.value.map(c => c.displayColor).join('・')
    return otherChords.value.slice(0, 3).map(c => c.displayColor).join('・') + 'など'
  })

  const otherChordsWithWeights = computed(() => {
    if (!parentChord.value || otherChords.value.length === 0) return []
    if (!isReviewWeighted.value || otherChords.value.length <= 1) {
      return otherChords.value.map(c => ({ ...c, weight: 1 / otherChords.value.length }))
    }
    const weights = otherChords.value.map(c => parentChord.value.sortOrder - c.sortOrder)
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    return otherChords.value.map((c, i) => ({ ...c, weight: weights[i] / totalWeight }))
  })

  const getRandomChord = () => {
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
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight
      for (let i = 0; i < oChords.length; i++) {
        if (random < weights[i]) return oChords[i]
        random -= weights[i]
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
