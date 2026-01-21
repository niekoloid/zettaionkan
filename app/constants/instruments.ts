/**
 * Instrument Sample Mappings and Utilities
 */

export const ALL_NOTES: string[] = [
  "A0", "Bb0", "B0",
  "C1", "Db1", "D1", "Eb1", "E1", "F1", "Gb1", "G1", "Ab1", "A1", "Bb1", "B1",
  "C2", "Db2", "D2", "Eb2", "E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2",
  "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
  "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
  "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5",
  "C6", "Db6", "D6", "Eb6", "E6", "F6", "Gb6", "G6", "Ab6", "A6", "Bb6", "B6",
  "C7", "Db7", "D7", "Eb7", "E7", "F7", "Gb7", "G7", "Ab7", "A7", "Bb7", "B7",
  "C8"
]

// The essential notes used by the 14 chords and the app keyboard (F3 to G5 range)
export const IROOTO_NOTES = [
  "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
  "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
  "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5"
]

const addAliases = (map: Record<string, string>): Record<string, string> => {
  const newMap = { ...map }
  Object.keys(newMap).forEach(note => {
    const val = newMap[note]
    if (!val) return

    if (note.includes('b')) {
      const sharp = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')
      if (sharp !== note) newMap[sharp] = val
    } else if (note.includes('#')) {
      const flat = note.replace('C#', 'Db').replace('D#', 'Eb').replace('F#', 'Gb').replace('G#', 'Ab').replace('A#', 'Bb')
      if (flat !== note) newMap[flat] = val
    }
  })
  return newMap
}

// Steinway Logic
const rawSteinwayFastMap: Record<string, string> = {}
const rawSteinwayFullMap: Record<string, string> = {}

// Limit ALL maps to IROOTO_NOTES as requested to save bandwidth and memory
IROOTO_NOTES.forEach(note => {
  rawSteinwayFullMap[note] = `${note}.mp3`
  // For "Fast" map, we could subset even more, but 27 notes is already lean enough.
  // Including all IROOTO_NOTES in both for consistency.
  rawSteinwayFastMap[note] = `${note}.mp3`
})

export const STEINWAY_FAST_MAP: Record<string, string> = addAliases(rawSteinwayFastMap)
export const STEINWAY_FULL_MAP: Record<string, string> = addAliases(rawSteinwayFullMap)
export const STEINWAY_MAP: Record<string, string> = STEINWAY_FAST_MAP

// Yamaha Logic (Salamander Grand Piano samples)
// For Yamaha, we also limit to IROOTO_NOTES but only if Salamander has them.
// Salamander samples are not available for every single note, Tone.js interpolates.
// We select a subset of IROOTO_NOTES that fit the Salamander naming convention.
const rawYamahaMap: Record<string, string> = {}
IROOTO_NOTES.forEach(note => {
  const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)(\d)/)
  if (!match || !match[1] || !match[2]) return

  const name = match[1]
  const octave = match[2]
  
  // Salamander samples include: A, C, D#, F# (using 's' for sharp)
  // We use sharp names for filename mapping
  let mappedName = ''
  if (name === 'A') mappedName = 'A'
  else if (name === 'C') mappedName = 'C'
  else if (name === 'Eb' || name === 'D#' || name === 'Db' || name === 'C#') {
    // Some mapping logic to select the best available sample
    if (name === 'Eb' || name === 'D#') mappedName = 'Ds'
  }
  else if (name === 'Gb' || name === 'F#') mappedName = 'Fs'
  
  if (mappedName) {
    const filename = mappedName + octave + '.mp3'
    rawYamahaMap[note] = filename
  }
})

export const YAMAHA_MAP: Record<string, string> = addAliases(rawYamahaMap)

