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
const isSteinwaySubsetNote = (note: string): boolean => {
  // We now have all samples (88 keys), so we accept everything in ALL_NOTES
  return true
}

const rawSteinwayMap: Record<string, string> = {}
ALL_NOTES.forEach(note => {
  if (isSteinwaySubsetNote(note)) {
    rawSteinwayMap[note] = `${note}.mp3`
  }
})

export const STEINWAY_MAP: Record<string, string> = addAliases(rawSteinwayMap)

// Yamaha Logic (Salamander Grand Piano samples)
const isYamahaSubsetNote = (note: string): boolean => {
  const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)(\d)/)
  if (!match || !match[1] || !match[2]) return false
  
  const name = match[1].replace('♯', '#').replace('♭', 'b')
  const octave = parseInt(match[2])
  
  const normalizedName = ({ 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' } as Record<string, string>)[name] || name
  
  if (normalizedName === 'A') return octave >= 0 && octave <= 7
  if (normalizedName === 'C') return octave >= 1 && octave <= 8
  if (normalizedName === 'D#') return octave >= 1 && octave <= 7
  if (normalizedName === 'F#') return octave >= 1 && octave <= 7
  
  return false
}

const rawYamahaMap: Record<string, string> = {}
ALL_NOTES.forEach(note => {
  if (isYamahaSubsetNote(note)) {
    // Yamaha samples use 's' for sharps and specific names (A, C, Ds, Fs)
    // Normalize to the sharp version for filename consistency
    const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)/)
    if (!match || !match[1]) return;

    const name = match[1].replace('♯', '#').replace('♭', 'b')
    const octaveMatch = note.match(/\d/)
    const octave = octaveMatch ? octaveMatch[0] : ''
    
    const sharpMap: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }
    const sharpName = sharpMap[name] || name
    
    const filename = sharpName.replace('#', 's') + octave + '.mp3'
    rawYamahaMap[note] = filename
  }
})

export const YAMAHA_MAP: Record<string, string> = addAliases(rawYamahaMap)
