<template>
  <div class="w-full overflow-x-auto custom-scrollbar">
    <div :id="elementId" class="min-w-[800px] bg-white text-left pl-4"></div>
    <div v-if="error" class="text-red-500 text-sm mt-2">Error: {{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import abcjs from 'abcjs'
import type { Chord } from '~/constants/chords'

const props = defineProps<{
  chords: Chord[]
}>()

const elementId = 'chord-stave-canvas'
const error = ref<string | null>(null)

// Generate ABC notation string
const generateAbc = (chords: Chord[]) => {
  // Header
  // L:1/4 for quarter notes (filled black heads)
  // K:C for C major key (standard staff)
  // M:none to hide time signature
  let abc = `
X:1
M:none
L:1/4
K:C treble
%%staffwidth 1600
%%gchordfont 12
`

  // Notes line
  let notesLine = ''
  // Lyrics line 1 (Chord Name)
  let wLine1 = 'w:'
  // Lyrics line 2 (Color Name)
  let wLine2 = 'w:'

  chords.forEach(chord => {
    // chord.abc is like "[CEG]". 
    // We append it.
    notesLine += `${chord.abc} `
    
    // Scape spaces in lyrics
    const name = chord.nameIt ? chord.nameIt.replace(/\s/g, '_') : '_'
    const color = chord.colorName ? chord.colorName.replace(/\s/g, '_') : '_'
    
    wLine1 += ` ${name}`
    wLine2 += ` ${color}`
  })

  return `${abc}\n${notesLine}\n${wLine1}\n${wLine2}`
}

const renderStave = async () => {
  if (!process.client) return
  error.value = null
  
  try {
    const abcString = generateAbc(props.chords)
    
    await nextTick()
    
    const visualObj = abcjs.renderAbc(elementId, abcString, {
      add_classes: true,
      paddingtop: 30, // Increased top padding
      paddingbottom: 50,
      paddingright: 30,
      paddingleft: 30,
      staffwidth: 1800, // Increased width for better spacing
      scale: 1.3, // Slightly larger scale
    })
    
    if (!visualObj || visualObj.length === 0) {
      // Check if element exists
      const el = document.getElementById(elementId)
      if (!el) {
         error.value = `Element #${elementId} not found`
      }
    }
  } catch (e: any) {
    console.error('abcjs render error:', e)
    error.value = e.message
  }
}

onMounted(() => {
  renderStave()
})

watch(() => props.chords, () => {
  renderStave()
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Custom styling for lyrics to make color distinct if possible */
:deep(.abcjs-lyric) {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: bold;
  fill: #374151; /* Gray-700 */
}

/* Hide stems to make it look like simple note heads */
:deep(.abcjs-stem) {
  display: none;
  stroke: none;
  fill: none;
}
</style>
