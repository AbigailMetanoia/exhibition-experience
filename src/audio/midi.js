import { noteOn } from './synth.js'

// Input dari keyboard MIDI eksternal (Chrome/Edge). Setiap not yang ditekan
// dibunyikan SATU OKTAF DI ATASNYA, agar pengunjung bisa mengikuti chord
// pengiring dan suaranya tetap terdengar terpisah.
const OCTAVE_UP = 12

const listeners = new Set()
const held = new Map() // nomor not → noteOff()

function handle({ data }) {
  const [status, note, vel = 0] = data
  const cmd = status & 0xf0
  if (cmd === 0x90 && vel > 0) {
    held.get(note)?.()
    held.set(note, noteOn(note + OCTAVE_UP, vel / 127))
    listeners.forEach((f) => f(note, vel))
  } else if (cmd === 0x80 || cmd === 0x90) {
    held.get(note)?.()
    held.delete(note)
  } else if (cmd === 0xb0 && (note === 123 || note === 120)) {
    // All Notes Off / All Sound Off
    held.forEach((off) => off())
    held.clear()
  }
}

export function initMidi() {
  navigator.requestMIDIAccess?.().then((access) => {
    const bind = (input) => { input.onmidimessage = handle }
    access.inputs.forEach(bind)
    // Keyboard yang dicolok belakangan juga langsung terbaca.
    access.onstatechange = (e) => {
      if (e.port.type === 'input' && e.port.state === 'connected') bind(e.port)
    }
  }).catch(() => {})
}

// Dengarkan setiap note-on (mis. untuk memulai permainan). Mengembalikan unsubscribe.
export function onMidiNote(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
