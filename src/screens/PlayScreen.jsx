import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import ChordTile from '../components/ChordTile.jsx'
import BubbleText from '../components/BubbleText.jsx'
import Piano from '../components/Piano.jsx'
import Notes from '../components/Notes.jsx'
import Mascot from '../components/Mascot.jsx'
import { CHORDS, PROGRESSIONS } from '../data/progressions.js'
import { getAudio, playSequence } from '../audio/synth.js'
import { onMidiNote } from '../audio/midi.js'

const COUNT_IN = 3 // ketukan hitung mundur sebelum mulai

// Teks penyemangat yang berganti setiap pindah chord (chord pertama selalu "Hold!").
const CHEERS = ['Hold!', 'Nice!', 'Keep going!', 'Groovy!', 'Great job!', 'You got this!', 'So smooth!', 'Rock on!']
const cheerFor = (i, total) => (i === total - 1 ? 'Last one!' : i === total - 2 && total > 3 ? 'Almost there!' : CHEERS[i % CHEERS.length])

export default function PlayScreen() {
  const { id } = useParams()
  const prog = PROGRESSIONS.find((p) => p.id === id)
  if (!prog) return <Navigate to="/" replace />
  return <Player key={id} prog={prog} />
}

function Player({ prog }) {
  const navigate = useNavigate()
  const [startAt, setStartAt] = useState(null)
  const [now, setNow] = useState(0)
  const beatMs = 60000 / prog.bpm

  // Urutan chord lengkap (termasuk pengulangan) dengan ketukan awal masing-masing.
  const { seq, totalBeats } = useMemo(() => {
    const seq = []
    let beat = 0
    for (let l = 0; l < prog.loops; l++)
      prog.steps.forEach(([key, beats], step) => {
        seq.push({ chord: CHORDS[key], step, start: beat, beats })
        beat += beats
      })
    return { seq, totalBeats: beat }
  }, [prog])

  // Mulai: not pertama dari keyboard MIDI (Chrome), klik/tap, atau Space/Enter.
  // Setelah itu layar berjalan sendiri — tidak mengikuti tuts yang ditekan.
  const start = useCallback(() => setStartAt((s) => s ?? performance.now()), [])
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') start()
      if (e.code === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    const offMidi = onMidiNote(start)
    return () => {
      window.removeEventListener('keydown', onKey)
      offMidi()
    }
  }, [start, navigate])

  // Suara: begitu mulai, jadwalkan semua chord di jam audio, sejajar dengan hitung mundur.
  useEffect(() => {
    if (startAt == null) return
    const ac = getAudio()
    if (!ac) return
    const beatSec = beatMs / 1000
    const elapsed = (performance.now() - startAt) / 1000
    return playSequence(seq, beatSec, ac.currentTime + COUNT_IN * beatSec - elapsed, prog.style, COUNT_IN)
  }, [startAt, seq, beatMs, prog.style])

  useEffect(() => {
    if (startAt == null) return
    let raf
    const tick = () => { setNow(performance.now()); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [startAt])

  const beat = startAt == null ? -COUNT_IN : (now - startAt) / beatMs - COUNT_IN
  const done = beat >= totalBeats
  useEffect(() => {
    if (done) navigate('/thanks', { replace: true })
  }, [done, navigate])

  const playing = beat >= 0
  const curIndex = Math.max(0, seq.findIndex((s) => beat < s.start + s.beats))
  const cur = seq[curIndex]
  const hold = playing ? Math.min(1, (beat - cur.start) / cur.beats) : 0
  const overall = playing ? Math.min(1, beat / totalBeats) : 0

  return (
    <Stage className="play">
      <Notes />
      <div className="bar"><div style={{ width: `${Math.max(overall * 100, 3.2)}%` }} /></div>

      <div className="heading">
        {startAt == null ? <BubbleText>Ready?</BubbleText>
          : !playing ? <BubbleText size={96}>{Math.ceil(-beat)}</BubbleText>
          : <span key={curIndex} className="cheer"><BubbleText>{cheerFor(curIndex, seq.length)}</BubbleText></span>}
      </div>

      <div className="chords">
        {prog.steps.map(([c], i) => {
          const isCur = i === cur.step
          return (
            <div key={i} className="slot">
              {isCur && <HoldRing progress={hold} />}
              <ChordTile name={c} size="lg" pressed={isCur && playing} />
            </div>
          )
        })}
      </div>

      <p className="hint">{startAt == null ? 'Press any key on the keyboard to start' : ''}</p>

      <Piano active={cur.chord.notes} />
      <Mascot mode={playing ? 'dance' : 'idle'} beatMs={beatMs} bounce={playing ? curIndex : -1} />

      {startAt == null && <button className="tap-to-start" onClick={start} aria-label="Start" />}

      <button className="back" onClick={() => navigate('/')} aria-label="Back">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Stage>
  )
}

// Cincin di sekeliling chord aktif; terisi penuh = waktunya pindah chord.
function HoldRing({ progress }) {
  const w = 235.1, h = 232.7, r = 39.3
  const len = 2 * (w + h - 4 * r) + 2 * Math.PI * r
  return (
    <svg className="ring" fill="none" width={w + 12.1} height={h + 12.1} viewBox={`-6.05 -6.05 ${w + 12.1} ${h + 12.1}`} aria-hidden>
      <rect width={w} height={h} rx={r} stroke="#0088FF" strokeOpacity="0.25" strokeWidth="12.09" />
      <rect width={w} height={h} rx={r} stroke="#0088FF" strokeWidth="12.09" pathLength={len}
        strokeDasharray={len} strokeDashoffset={len * (1 - progress)} strokeLinecap="round" />
    </svg>
  )
}
