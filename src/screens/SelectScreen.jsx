import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import ChordTile from '../components/ChordTile.jsx'
import Notes from '../components/Notes.jsx'
import { DEFAULT_PROGRESSION, PROGRESSIONS } from '../data/progressions.js'
import * as sfx from '../audio/sfx.js'
import logoTitle from '../assets/logo-title.svg'
import playIcon from '../assets/icon-play-white.svg'
import birthday from '../assets/scene-birthday.svg'
import sailing from '../assets/scene-sailing.svg'
import stargazing from '../assets/scene-stargazing.svg'

const SCENES = { birthday, sailing, stargazing }

// Diingat selama aplikasi berjalan, agar tombol Back kembali ke kartu yang sama.
let lastSelected = DEFAULT_PROGRESSION

export default function SelectScreen() {
  const navigate = useNavigate()
  const [sel, setSel] = useState(lastSelected)
  const swipe = useRef(null)
  const swiped = useRef(false) // cegah "klik" setelah gestur geser ikut memulai permainan

  const go = (i) => {
    const next = Math.max(0, Math.min(PROGRESSIONS.length - 1, i))
    if (next === sel) return sfx.bump() // sudah mentok di ujung
    sfx.swipe(next > sel ? 1 : -1)
    sfx.click(next)
    setSel((lastSelected = next))
  }
  const startGame = () => {
    sfx.success()
    navigate(`/play/${PROGRESSIONS[sel].id}`)
  }

  useEffect(() => {
    const onKey = (e) => {
      // Enter/Space pada tombol yang sedang fokus sudah ditangani oleh onClick tombol itu.
      if ((e.code === 'Enter' || e.code === 'Space') && e.target.closest?.('button')) return
      if (e.code === 'ArrowLeft') go(sel - 1)
      if (e.code === 'ArrowRight') go(sel + 1)
      if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); startGame() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <Stage className="select">
      <Notes />
      <img className="logo-title" src={logoTitle} alt="Chordisol" width="726" height="116" />
      <p className="subtitle">Choose one of the progressions below!</p>

      <div className="carousel"
        onPointerDown={(e) => { swipe.current = e.clientX; swiped.current = false }}
        onPointerUp={(e) => {
          const dx = e.clientX - (swipe.current ?? e.clientX)
          swipe.current = null
          swiped.current = Math.abs(dx) > 60
          if (swiped.current) go(sel + (dx < 0 ? 1 : -1))
        }}>
        {PROGRESSIONS.map((p, i) => {
          const offset = i - sel
          return (
            <button key={p.id}
              className={`prog-card ${offset === 0 ? 'active' : Math.abs(offset) === 1 ? 'side' : 'far'}`}
              style={{ '--offset': offset }}
              tabIndex={Math.abs(offset) > 1 ? -1 : 0}
              aria-hidden={Math.abs(offset) > 1}
              aria-label={`${p.title}: ${p.steps.map(([c]) => c).join(', ')}`}
              onClick={() => {
                if (swiped.current) { swiped.current = false; return }
                if (offset === 0) startGame()
                else go(i)
              }}>
              <img className="scene" src={SCENES[p.scene]} alt="" draggable="false" />
              <span className="card-tiles">
                {p.steps.map(([c], j) => <ChordTile key={j} name={c} size="md" />)}
              </span>
            </button>
          )
        })}
      </div>

      <button className="start" onClick={startGame}>
        <img src={playIcon} alt="" width="39" height="40" />
        Let’s Start
      </button>
    </Stage>
  )
}
