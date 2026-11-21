import { isBlack, noteName } from '../data/progressions.js'

const WHITE_W = 79.5
const GAP = 4.7

// Keyboard visual saja — tidak membaca input MIDI. Rentang default C3–F4 sesuai hi-fi.
export default function Piano({ from = 48, to = 65, active = [] }) {
  const notes = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const whites = notes.filter((n) => !isBlack(n))
  const on = (n) => active.includes(n)

  return (
    <div className="piano" role="img" aria-label={`Press ${active.map(noteName).join(', ')}`}>
      {whites.map((n) => (
        <div key={n} className={`key white ${on(n) ? 'on' : ''}`}>
          {on(n) && <span className="dot" />}
          <span className="label">{noteName(n)}</span>
        </div>
      ))}
      {notes.filter(isBlack).map((n) => {
        const boundary = whites.filter((x) => x < n).length * (WHITE_W + GAP) - GAP / 2
        return (
          <div key={n} className={`key black ${on(n) ? 'on' : ''}`} style={{ left: boundary - 47.1 / 2 }}>
            {on(n) && <><span className="dot" /><span className="label">{noteName(n)}</span></>}
          </div>
        )
      })}
    </div>
  )
}
