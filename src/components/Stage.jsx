import { useEffect, useState } from 'react'
import clouds from '../assets/clouds.svg'

// Kanvas 1512×982 (ukuran frame hi-fi MacBook Pro 14") yang diskalakan agar pas di layar mana pun.
export const W = 1512
export const H = 982
const fit = () => Math.min(window.innerWidth / W, window.innerHeight / H)

export default function Stage({ children, className = '' }) {
  const [scale, setScale] = useState(fit)
  useEffect(() => {
    const onResize = () => setScale(fit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <div className="viewport">
      <img className="clouds" src={clouds} alt="" width={W} height={H} />
      <div className={`stage ${className}`} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
