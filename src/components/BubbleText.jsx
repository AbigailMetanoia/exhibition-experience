// Teks bergaya judul hi-fi (biru dengan outline tebal biru muda) untuk teks yang dinamis.
export default function BubbleText({ children, size = 80 }) {
  const w = String(children).length * size * 0.62 + size * 0.6
  const h = size * 1.35
  return (
    <svg className="bubble" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={String(children)}>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size}
        fill="#2391FF" stroke="#E0F1FF" strokeWidth={size * 0.29} strokeLinejoin="round" paintOrder="stroke">
        {children}
      </text>
    </svg>
  )
}
