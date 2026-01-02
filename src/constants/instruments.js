/**
 * Instrument Sample Mappings and Utilities
 */

export const ALL_NOTES = [
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
  const match = note.match(/([A-G][b#]?|Ab|Bb|Db|Eb|Gb)(\d)/)
  if (!match) return false
  
  const name = match[1].replace('♯', '#').replace('♭', 'b')
  const octave = parseInt(match[2])
  
  const normalizedName = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' }[name] || name
  
  if (normalizedName === 'A') return octave >= 1 && octave <= 7
  if (normalizedName === 'C') return octave >= 1 && octave <= 8
  if (normalizedName === 'Eb') return octave >= 1 && octave <= 7
  if (normalizedName === 'Gb') return octave >= 1 && octave <= 6
  
  return false
}

const rawSteinwayMap = {}
ALL_NOTES.forEach(note => {
  if (isSteinwaySubsetNote(note)) {
    rawSteinwayMap[note] = `${note}.wav`
  }
})

export const STEINWAY_MAP = addAliases(rawSteinwayMap)

const rawYamahaMap = {
  "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3"
}

export const YAMAHA_MAP = addAliases(rawYamahaMap)

export const XYLOPHONE_SAMPLES = addAliases({
  "G4": "G4.mp3",
  "C5": "C5.mp3", "G5": "G5.mp3",
  "C6": "C6.mp3", "G6": "G6.mp3",
  "C7": "C7.mp3", "G7": "G7.mp3"
})

export const RAIN_DRUM_SAMPLES = addAliases({
  "A2": "A2.mp3", "B2": "B2.mp3", "B3": "B3.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3" 
})

export const VIOLIN_SAMPLES = addAliases({
  "A3": "A3.mp3", "C4": "C4.mp3", "G4": "G4.mp3", "A4": "A4.mp3",
  "A5": "A5.mp3", "A6": "A6.mp3"
})

export const FLUTE_SAMPLES = addAliases({
  "A4": "A4.mp3", "C5": "C5.mp3", "A5": "A5.mp3", "A6": "A6.mp3"
})

export const GUITAR_SAMPLES = addAliases({
  "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3",
  "B3": "B3.mp3", "E4": "E4.mp3", "G4": "G4.mp3"
})

export const getSampleMap = (extension) => {
  const map = {}
  ALL_NOTES.forEach(note => {
    map[note] = `${note}.${extension}`
  })
  return addAliases(map)
}
