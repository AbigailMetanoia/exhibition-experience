import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SelectScreen from './screens/SelectScreen.jsx'
import PlayScreen from './screens/PlayScreen.jsx'
import ThanksScreen from './screens/ThanksScreen.jsx'

const EXIT_MS = 280 // samakan dengan durasi animasi .page-out di index.css

// Transisi antar halaman: halaman lama dianimasikan keluar dulu, baru halaman baru masuk.
export default function App() {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const leaving = location.key !== shown.key

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setShown(location), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving, location])

  return (
    <div key={shown.key} className={`page ${leaving ? 'page-out' : 'page-in'}`}>
      <Routes location={shown}>
        <Route path="/" element={<SelectScreen />} />
        <Route path="/play/:id" element={<PlayScreen />} />
        <Route path="/thanks" element={<ThanksScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
