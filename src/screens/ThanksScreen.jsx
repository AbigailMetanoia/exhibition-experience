import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Stage from '../components/Stage.jsx'
import Notes from '../components/Notes.jsx'
import { APP } from '../data/progressions.js'
import { thanksCelebration } from '../audio/sfx.js'
import titleDone from '../assets/title-done.svg'
import appIcon from '../assets/app-icon.svg'
import logo from '../assets/logo-chordisol.svg'
import badge from '../assets/appstore-badge.svg'
import star from '../assets/star.svg'
import playIcon from '../assets/icon-play.svg'
import qrCode from '../assets/qr-chordisol.png'

const IDLE_SECONDS = 30 // kembali otomatis ke layar awal untuk pengunjung berikutnya

// Urutan muncul: "You did it!" tampil sendiri di tengah → naik ke atas →
// lalu kartu, ikon, logo, badge, QR, dekorasi, dan tombol muncul satu per satu (--i).
export default function ThanksScreen() {
  const navigate = useNavigate()
  useEffect(() => thanksCelebration(), []) // fanfare + suara tiap elemen yang muncul
  useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), IDLE_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <Stage className="thanks">
      <div className="deco-wrap pop" style={{ '--i': 6 }}>
        <Notes pink={[168, 116, 55]} blue={[1309, 817, 72]} />
      </div>
      <img className="star star-a pop" style={{ '--i': 6 }} src={star} alt="" width="89" height="89" />
      <img className="star star-b pop" style={{ '--i': 7 }} src={star} alt="" width="80" height="80" />

      <img className="title" src={titleDone} alt="You did it!" width="538" height="141" />

      <section className="card pop" style={{ '--i': 0 }}>
        <img className="icon pop" style={{ '--i': 1 }} src={appIcon} alt="" width="274" height="274" />
        <img className="logo pop" style={{ '--i': 2 }} src={logo} alt={APP.name} width="331" height="65" />
        <img className="badge pop" style={{ '--i': 3 }} src={badge} alt="Download on the App Store" width="332.5" height="113.8" />
        <div className="qr pop" style={{ '--i': 4 }}>
          <img src={qrCode} alt={`QR code ${APP.name} di App Store`} width="410" height="410" />
        </div>
      </section>

      <button className="again pop" style={{ '--i': 8 }} onClick={() => navigate('/', { replace: true })}>
        <img src={playIcon} alt="" width="34.2" height="34.6" />
        Play Again
      </button>
    </Stage>
  )
}
