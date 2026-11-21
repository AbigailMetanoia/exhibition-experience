import { getAudio, freq, noise, note, clap, noiseHit, stoppableBus, INSTRUMENTS } from './synth.js'

// Efek suara UI yang dibuat langsung dengan Web Audio (tanpa file audio).
let out = null
function setup() {
  const ac = getAudio()
  if (!ac) return null
  if (!out) {
    out = ac.createGain()
    out.gain.value = 0.9
    out.connect(ac.destination)
  }
  return ac
}

function pannedOut(ac, dest, pan) {
  if (!ac.createStereoPanner || !pan) return dest
  const p = ac.createStereoPanner()
  p.pan.value = pan
  p.connect(dest)
  return p
}

// ── Bahan dasar (bisa dijadwalkan di waktu t, ke tujuan dest) ───────────────
function sweepNoise(ac, dest, t, { from, to, dur, vol, pan = 0 }) {
  const src = ac.createBufferSource()
  src.buffer = noise(ac)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.2
  bp.frequency.setValueAtTime(from, t)
  bp.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8)
  const g = ac.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.25)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(bp).connect(g).connect(pannedOut(ac, dest, pan))
  src.start(t)
  src.stop(t + dur + 0.02)
}

function blip(ac, dest, t, { from, to, dur, vol, type = 'sine' }) {
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(from, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.5)
  const g = ac.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(dest)
  o.start(t)
  o.stop(t + dur + 0.02)
}

// "Bloop" balon/gelembung — untuk elemen yang muncul.
const bloop = (ac, dest, t, midi, vol = 0.3) => {
  blip(ac, dest, t, { from: freq(midi - 7), to: freq(midi), dur: 0.16, vol })
  blip(ac, dest, t + 0.005, { from: freq(midi + 12), to: freq(midi + 19), dur: 0.06, vol: vol * 0.25, type: 'triangle' })
}

// Kilau: lonceng-lonceng tinggi naik cepat — untuk bintang & dekorasi.
const sparkle = (ac, dest, t, base = 84, vol = 0.09) =>
  [0, 4, 7, 12, 16].forEach((d, i) => note(ac, dest, base + d, t + i * 0.035, 0.4, vol, INSTRUMENTS.bell))

// ── Lobby ───────────────────────────────────────────────────────────────────
// Bunyi "swish" saat kartu bergeser. dir: -1 = ke kiri, 1 = ke kanan.
export function swipe(dir = 1) {
  const ac = setup()
  if (!ac) return
  sweepNoise(ac, out, ac.currentTime, { from: dir > 0 ? 700 : 2600, to: dir > 0 ? 2600 : 700, dur: 0.28, vol: 0.35, pan: dir * 0.4 })
}

// Bunyi "klik" kecil saat kartu baru berhenti di tengah. Nada naik-turun sesuai posisi.
export function click(index = 0) {
  const ac = setup()
  if (!ac) return
  blip(ac, out, ac.currentTime + 0.12, { from: freq(84 + index * 2), to: freq(79 + index * 2), dur: 0.09, vol: 0.22, type: 'triangle' })
}

// Bunyi "duk" pelan saat sudah mentok di ujung carousel.
export function bump() {
  const ac = setup()
  if (!ac) return
  blip(ac, out, ac.currentTime, { from: 170, to: 80, dur: 0.16, vol: 0.35 })
}

// Bunyi "berhasil": arpeggio lonceng naik (C–E–G–C).
export function success() {
  const ac = setup()
  if (!ac) return
  const t0 = ac.currentTime
  ;[72, 76, 79, 84].forEach((m, i) =>
    note(ac, out, m, t0 + i * 0.075, i === 3 ? 0.8 : 0.3, i === 3 ? 0.26 : 0.18, INSTRUMENTS.bell))
}

// ── Layar "You did it!" ─────────────────────────────────────────────────────
// Waktu di sini HARUS sama dengan animasi di index.css:
//   .thanks .title  → title-intro 2.1s (naik ke atas mulai 62% = ±1.3s)
//   .pop            → mulai di --after-title (2.1s) + --i × 0.16s
export const THANKS_TIMING = { titleUp: 1.3, afterTitle: 2.1, step: 0.16 }

// Elemen yang muncul (sesuai --i di ThanksScreen.jsx) → suaranya.
const THANKS_POPS = [
  { i: 0, kind: 'card' }, // kartu putih
  { i: 1, kind: 'bloop', midi: 72 }, // ikon aplikasi
  { i: 2, kind: 'bloop', midi: 76 }, // logo
  { i: 3, kind: 'bloop', midi: 79 }, // badge App Store
  { i: 4, kind: 'bloop', midi: 84 }, // QR
  { i: 6, kind: 'sparkle', base: 84 }, // not & bintang kiri bawah
  { i: 7, kind: 'sparkle', base: 91 }, // bintang kanan atas
  { i: 8, kind: 'button' }, // tombol Play Again
]

// Mainkan seluruh rangkaian suara layar apresiasi. Mengembalikan stop().
export function thanksCelebration() {
  const ac = setup()
  if (!ac) return () => {}
  const { bus, stop } = stoppableBus(ac)
  const t0 = ac.currentTime + 0.05
  const { titleUp, afterTitle, step } = THANKS_TIMING

  // 1) "Ta-daa!" saat judul muncul: tiupan brass + simbal + kilau + tepuk tangan.
  const brass = ac.createBiquadFilter() // lembutkan brass agar tidak cempreng
  brass.type = 'lowpass'
  brass.frequency.value = 2400
  brass.connect(bus)
  ;[67, 71, 74].forEach((m) => note(ac, brass, m, t0, 0.12, 0.1, INSTRUMENTS.brass))
  ;[72, 76, 79, 84].forEach((m) => note(ac, brass, m, t0 + 0.16, 1.1, 0.1, INSTRUMENTS.brass))
  note(ac, bus, 48, t0 + 0.16, 1.1, 0.3, INSTRUMENTS.bass)
  noiseHit(ac, bus, t0 + 0.16, { vol: 0.22, decay: 1.6, type: 'highpass', f: 5000 })
  ;[84, 86, 88, 91, 93, 96, 98, 100].forEach((m, i) => note(ac, bus, m, t0 + 0.2 + i * 0.045, 0.5, 0.06, INSTRUMENTS.bell))
  for (let k = 0; k < 9; k++) clap(ac, bus, t0 + 0.35 + k * 0.11 + Math.random() * 0.04)

  // 2) "Wuush" ke atas saat judul naik.
  sweepNoise(ac, bus, t0 + titleUp, { from: 400, to: 3200, dur: 0.75, vol: 0.3 })
  blip(ac, bus, t0 + titleUp + 0.1, { from: freq(60), to: freq(84), dur: 0.6, vol: 0.06, type: 'triangle' })

  // 3) Elemen muncul satu per satu.
  for (const p of THANKS_POPS) {
    const t = t0 + afterTitle + p.i * step + 0.04
    if (p.kind === 'card') {
      bloop(ac, bus, t, 60, 0.4)
      noiseHit(ac, bus, t, { vol: 0.12, decay: 0.2, type: 'lowpass', f: 900 })
    } else if (p.kind === 'bloop') bloop(ac, bus, t, p.midi)
    else if (p.kind === 'sparkle') sparkle(ac, bus, t, p.base)
    else if (p.kind === 'button') {
      bloop(ac, bus, t, 79, 0.3)
      ;[72, 76, 79, 84].forEach((m) => note(ac, bus, m, t + 0.08, 0.9, 0.07, INSTRUMENTS.bell))
    }
  }
  return stop
}
