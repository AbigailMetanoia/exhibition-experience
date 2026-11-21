// Semua data chord & progression ada di sini.
// Notes = nomor MIDI (60 = Middle C / C4). Keyboard di layar menampilkan C3 (48) – F4 (65), sesuai hi-fi.
export const CHORDS = {
  C: { name: 'C', notes: [48, 52, 55] },
  Dm: { name: 'Dm', notes: [50, 53, 57] },
  D: { name: 'D', notes: [50, 54, 57] },
  F: { name: 'F', notes: [53, 57, 60] },
  G: { name: 'G', notes: [55, 59, 62] },
  Am: { name: 'Am', notes: [57, 60, 64] },
  A: { name: 'A', notes: [57, 61, 64] },
  // Chord 7-an (4 not), voicing disesuaikan agar muat di keyboard C3–F4.
  Cmaj7: { name: 'Cmaj7', notes: [48, 52, 55, 59] },
  Dm7: { name: 'Dm7', notes: [50, 53, 57, 60] },
  G7: { name: 'G7', notes: [55, 59, 62, 65] },
  Am7: { name: 'Am7', notes: [55, 57, 60, 64] },
}

// Sesuai desain "Choose" (carousel). beats = berapa ketukan chord ditahan.
// scene = ilustrasi kartu (src/assets/scene-*.svg). Urutan = urutan di carousel.
// style = gaya iringan (src/audio/synth.js → STYLES), bpm disesuaikan dengan suasana kartu:
//   Birthday   → pesta, ceria & bouncy   (party, 118 bpm)
//   Sailing    → santai berlayar, gitar  (strum, 100 bpm)
//   Stargazing → malam tenang berkilau   (dreamy, 88 bpm)
export const PROGRESSIONS = [
  { id: 'birthday', title: 'Birthday', scene: 'birthday', style: 'party', bpm: 118, loops: 3, steps: [['Dm7', 4], ['G7', 4], ['Cmaj7', 4]] },
  { id: 'sailing', title: 'Sailing', scene: 'sailing', style: 'strum', bpm: 100, loops: 2, steps: [['Am', 4], ['F', 4], ['C', 4], ['G', 4]] },
  { id: 'stargazing', title: 'Stargazing', scene: 'stargazing', style: 'dreamy', bpm: 88, loops: 2, steps: [['C', 4], ['G', 4], ['Am', 4], ['F', 4]] },
]
export const DEFAULT_PROGRESSION = 1 // kartu yang terpilih di tengah saat pertama kali

export const APP = {
  name: 'Chordisol',
  tagline: 'Learn chords by feel, one progression at a time.',
  appStoreUrl: '', // isi saat link App Store sudah ada → QR code otomatis muncul
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const noteName = (midi) => NOTE_NAMES[midi % 12]
export const isBlack = (midi) => [1, 3, 6, 8, 10].includes(midi % 12)
