/**
 * Instrument Sample Mappings and Utilities
 */

export const ALL_NOTES = [
  "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
  "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
  "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5"
]

const addAliases = (map) => {
  const newMap = { ...map }
  Object.keys(newMap).forEach(note => {
    if (note.includes('b')) {
      const sharp = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')
      if (sharp !== note) newMap[sharp] = newMap[note]
    } else if (note.includes('#')) {
      const flat = note.replace('C#', 'Db').replace('D#', 'Eb').replace('F#', 'Gb').replace('G#', 'Ab').replace('A#', 'Bb')
      if (flat !== note) newMap[flat] = newMap[note]
    }
  })
  return newMap
}

// Steinway Logic
const isSteinwaySubsetNote = (note) => {
  // We now have all samples (88 keys), so we accept everything in ALL_NOTES
  return true
}

const rawSteinwayMap = {}
ALL_NOTES.forEach(note => {
  if (isSteinwaySubsetNote(note)) {
    rawSteinwayMap[note] = `${note}.mp3`
  }
})

export const STEINWAY_MAP = addAliases(rawSteinwayMap)

// Yamaha Logic (Salamander Grand Piano samples)
const isYamahaSubsetNote = (note) => {
  const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)(\d)/)
  if (!match) return false
  
  const name = match[1].replace('♯', '#').replace('♭', 'b')
  const octave = parseInt(match[2])
  
  const normalizedName = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }[name] || name
  
  if (normalizedName === 'A') return octave >= 0 && octave <= 7
  if (normalizedName === 'C') return octave >= 1 && octave <= 8
  if (normalizedName === 'D#') return octave >= 1 && octave <= 7
  if (normalizedName === 'F#') return octave >= 1 && octave <= 7
  
  return false
}

const rawYamahaMap = {}
ALL_NOTES.forEach(note => {
  if (isYamahaSubsetNote(note)) {
    // Yamaha samples use 's' for sharps and specific names (A, C, Ds, Fs)
    // Normalize to the sharp version for filename consistency
    const name = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)/)[1].replace('♯', '#').replace('♭', 'b')
    const octave = note.match(/\d/)[0]
    const sharpName = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }[name] || name
    
    const filename = sharpName.replace('#', 's') + octave + '.mp3'
    rawYamahaMap[note] = filename
  }
})

export const YAMAHA_MAP = addAliases(rawYamahaMap)
