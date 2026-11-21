import notePink from '../assets/note-pink.svg'
import noteBlue from '../assets/note-blue.svg'

// Not musik dekoratif (pink & biru) yang muncul di tiap layar, posisi sesuai desain.
export default function Notes({ pink = [249, 108, 48], blue = [1175, 113, 72] }) {
  return (
    <>
      <img className="deco note-pink" src={notePink} alt="" width={pink[2]}
        style={{ left: pink[0], top: pink[1] }} />
      <img className="deco note-blue" src={noteBlue} alt="" width={blue[2]}
        style={{ left: blue[0], top: blue[1] }} />
    </>
  )
}
