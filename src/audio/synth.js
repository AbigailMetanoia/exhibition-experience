// Synth & iringan musik pakai Web Audio API (tanpa file audio / library).
// Satu AudioContext dipakai bersama untuk seluruh app.
let ctx = null

export function getAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Browser hanya mengizinkan audio setelah interaksi pengguna — buka kuncinya
// pada klik/tap/tombol pertama di mana pun (mis. saat memilih progression).
export function unlockAudioOnFirstGesture() {
  const unlock = () => {
    getAudio()
    ;['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock))
  }
  ;['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock))
}

export const freq = (midi) => 440 * 2 ** ((midi - 69) / 12)

// ── Instrumen ──────────────────────────────────────────────────────────────
// Tiap instrumen = partial [tipe, kelipatan frekuensi, volume] + bentuk envelope.
export const INSTRUMENTS = {
  // Electric piano lembut (dipakai juga untuk not dari keyboard MIDI).
  keys: { partials: [['sine', 1, 1], ['triangle', 2, 0.18], ['sine', 3, 0.06]], attack: 0.012, decay: 0.6, sustain: 0.3 },
  // Stab pendek & cerah untuk pesta (Birthday).
  stab: { partials: [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 4, 0.08]], attack: 0.005, decay: 0.18, sustain: 0.12 },
  // Petikan gitar/ukulele (Sailing).
  pluck: { partials: [['triangle', 1, 1], ['sine', 2, 0.45], ['sine', 3, 0.2], ['sine', 5, 0.05]], attack: 0.004, decay: 0.35, sustain: 0.05 },
  // Pad hangat, masuk perlahan (Stargazing).
  pad: { partials: [['sine', 1, 1], ['triangle', 1.004, 0.5], ['sine', 2, 0.12]], attack: 0.35, decay: 1, sustain: 0.8 },
  // Lonceng kecil berkilau.
  bell: { partials: [['sine', 1, 1], ['sine', 2.01, 0.3], ['sine', 3.98, 0.12]], attack: 0.004, decay: 0.5, sustain: 0.04 },
  // Bass bulat.
  bass: { partials: [['sine', 1, 1], ['triangle', 2, 0.25]], attack: 0.008, decay: 0.3, sustain: 0.55 },
  // Tiupan "brass" untuk fanfare.
  brass: { partials: [['sawtooth', 1, 0.5], ['square', 1.003, 0.2], ['sine', 2, 0.3]], attack: 0.03, decay: 0.4, sustain: 0.6 },
}

// Mulai satu not. Mengembalikan release(t) untuk melepasnya.
export function startVoice(ac, out, midi, t0, peak, inst = INSTRUMENTS.keys) {
  const env = ac.createGain()
  env.gain.setValueAtTime(0, t0)
  env.gain.linearRampToValueAtTime(peak, t0 + inst.attack)
  env.gain.setTargetAtTime(peak * inst.sustain, t0 + inst.attack, inst.decay / 3)
  env.connect(out)
  const oscs = inst.partials.map(([type, mult, gain]) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = type
    osc.frequency.value = freq(midi) * mult
    g.gain.value = gain
    osc.connect(g).connect(env)
    osc.start(t0)
    return osc
  })
  return (t = ac.currentTime) => {
    // Tahan nilai saat ini (hindari "klik"), lalu fade out.
    if (env.gain.cancelAndHoldAtTime) env.gain.cancelAndHoldAtTime(t)
    else env.gain.cancelScheduledValues(t)
    env.gain.setTargetAtTime(0, t, 0.06)
    oscs.forEach((o) => o.stop(t + 0.5))
  }
}

export function note(ac, out, midi, t0, dur, peak, inst) {
  startVoice(ac, out, midi, t0, peak, inst)(Math.max(t0 + 0.03, t0 + dur))
}

// ── Perkusi ────────────────────────────────────────────────────────────────
let noiseBuf = null
export function noise(ac) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

export function kick(ac, out, t, vol = 0.8) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.frequency.setValueAtTime(140, t)
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + 0.32)
}

export function noiseHit(ac, out, t, { vol, decay, type, f, q = 0.8 }) {
  const src = ac.createBufferSource()
  src.buffer = noise(ac)
  const filt = ac.createBiquadFilter()
  filt.type = type
  filt.frequency.value = f
  filt.Q.value = q
  const g = ac.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + decay)
  src.connect(filt).connect(g).connect(out)
  src.start(t, Math.random() * 0.5)
  src.stop(t + decay + 0.02)
}

// Tiga semburan rapat = suara tepuk tangan.
export const clap = (ac, out, t) =>
  [0, 0.012, 0.024].forEach((d, i) => noiseHit(ac, out, t + d, { vol: i === 2 ? 0.5 : 0.3, decay: i === 2 ? 0.16 : 0.02, type: 'bandpass', f: 1400, q: 1.2 }))
const hat = (ac, out, t, vol = 0.12) => noiseHit(ac, out, t, { vol, decay: 0.045, type: 'highpass', f: 7500 })
const shaker = (ac, out, t, vol = 0.08) => noiseHit(ac, out, t, { vol, decay: 0.07, type: 'bandpass', f: 5200, q: 0.7 })

// ── Gaya iringan per kartu ───────────────────────────────────────────────────
// Dipanggil untuk tiap chord: notes = not chord, t0 = waktu mulai, b = durasi 1 ketukan.
const STYLES = {
  // Birthday: pesta! Bass "oom-pah", stab chord di ketukan 2 & 4, tepuk tangan, hi-hat swing.
  party(ac, out, notes, t0, beats, b) {
    const root = notes[0] - 12
    for (let k = 0; k < beats; k++) {
      const t = t0 + k * b
      if (k % 2 === 0) {
        kick(ac, out, t, 0.7)
        note(ac, out, k % 4 === 0 ? root : root + 7, t, b * 0.85, 0.32, INSTRUMENTS.bass)
      } else {
        clap(ac, out, t)
        notes.forEach((n, i) => note(ac, out, n + 12, t + i * 0.006, b * 0.45, 0.13, INSTRUMENTS.stab))
      }
      hat(ac, out, t + b * 0.66, 0.1) // swing
      if (k === beats - 1) notes.forEach((n) => note(ac, out, n + 12, t + b * 0.66, b * 0.3, 0.09, INSTRUMENTS.stab))
    }
  },

  // Sailing: gitar di perahu. Genjrengan di ketukan 1, lalu petikan arpeggio 8-an + shaker.
  strum(ac, out, notes, t0, beats, b) {
    const root = notes[0] - 12
    notes.forEach((n, i) => note(ac, out, n, t0 + i * 0.018, b * 1.6, 0.16, INSTRUMENTS.pluck))
    const pattern = [0, 1, 2, 1, notes.length - 1, 1, 2, 1]
    for (let e = 1; e < beats * 2; e++) {
      const t = t0 + e * (b / 2)
      const n = notes[pattern[e % pattern.length] % notes.length] + (e % 4 === 2 ? 12 : 0)
      note(ac, out, n, t, b * 0.8, e % 2 ? 0.09 : 0.12, INSTRUMENTS.pluck)
      shaker(ac, out, t, e % 2 ? 0.09 : 0.05)
    }
    for (let k = 0; k < beats; k += 2) {
      kick(ac, out, t0 + k * b, 0.45)
      note(ac, out, k % 4 === 0 ? root : root + 7, t0 + k * b, b * 1.8, 0.26, INSTRUMENTS.bass)
    }
  },

  // Stargazing: malam yang tenang. Pad hangat ditahan + lonceng berkilau naik-turun.
  dreamy(ac, out, notes, t0, beats, b) {
    const dur = beats * b
    notes.forEach((n) => note(ac, out, n, t0, dur, 0.1, INSTRUMENTS.pad))
    note(ac, out, notes[0] - 12, t0, dur, 0.22, INSTRUMENTS.bass)
    const up = [...notes.map((n) => n + 12), notes[0] + 24]
    const twinkle = [...up, ...up.slice(1, -1).reverse()]
    for (let e = 0; e < beats * 2; e++) {
      note(ac, out, twinkle[e % twinkle.length], t0 + e * (b / 2), b * 1.5, e % 2 ? 0.05 : 0.08, INSTRUMENTS.bell)
    }
    noiseHit(ac, out, t0, { vol: 0.04, decay: 1.2, type: 'highpass', f: 9000 }) // desir lembut
  },

  // Cadangan: chord ditahan seperti versi awal.
  hold(ac, out, notes, t0, beats, b) {
    notes.forEach((n, i) => note(ac, out, n, t0 + i * 0.012, beats * b - 0.08, 0.22, INSTRUMENTS.keys))
    note(ac, out, notes[0] - 12, t0, beats * b - 0.08, 0.22, INSTRUMENTS.keys)
  },
}

// Bus untuk not yang dimainkan pengunjung lewat keyboard MIDI.
let liveBus = null

// Mainkan satu not sekarang (dipakai input MIDI). Mengembalikan fungsi noteOff().
export function noteOn(midi, velocity = 0.8) {
  const ac = getAudio()
  if (!ac) return () => {}
  if (!liveBus) {
    liveBus = ac.createGain()
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4500
    const comp = ac.createDynamicsCompressor()
    liveBus.connect(lp).connect(comp).connect(ac.destination)
  }
  const release = startVoice(ac, liveBus, midi, ac.currentTime, 0.1 + 0.2 * velocity)
  let off = false
  return () => { if (!off) { off = true; release() } }
}

// Bus sementara yang bisa dihentikan dengan fade singkat (untuk iringan & rangkaian sfx).
export function stoppableBus(ac) {
  const bus = ac.createGain()
  const comp = ac.createDynamicsCompressor()
  bus.connect(comp).connect(ac.destination)
  const stop = () => {
    const t = ac.currentTime
    bus.gain.cancelScheduledValues(t)
    bus.gain.setValueAtTime(bus.gain.value, t)
    bus.gain.linearRampToValueAtTime(0, t + 0.15)
    setTimeout(() => bus.disconnect(), 300)
  }
  return { bus, stop }
}

// Jadwalkan seluruh iringan sekaligus (timing presisi dari jam audio).
// seq: [{ chord: { notes }, start, beats }], startAt = detik AudioContext untuk ketukan 0.
// style: nama gaya di STYLES. Mengembalikan stop() untuk menghentikan semua suara.
export function playSequence(seq, beatSec, startAt, style = 'hold', countIn = 0) {
  const ac = getAudio()
  if (!ac) return () => {}
  const { bus, stop } = stoppableBus(ac)
  // Hitung mundur: bunyi "tok" kayu di tiap ketukan sebelum mulai (ketukan terakhir lebih tinggi).
  for (let k = countIn; k >= 1; k--) {
    const due = startAt - k * beatSec
    if (due < ac.currentTime - 0.05) continue // ketukan ini sudah lewat
    const t = Math.max(due, ac.currentTime) // jangan pernah menjadwalkan di waktu negatif/lampau
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    o.frequency.value = k === 1 ? 1568 : 1046
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.3, t + 0.002)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
    o.connect(g).connect(bus)
    o.start(t)
    o.stop(t + 0.08)
  }
  const play = STYLES[style] ?? STYLES.hold
  for (const s of seq) play(ac, bus, s.chord.notes, startAt + s.start * beatSec, s.beats, beatSec)
  return stop
}
