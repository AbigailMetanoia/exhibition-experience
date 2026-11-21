// Maskot not biru (dari "Mascot new.svg") yang dipecah per bagian agar bisa menari.
// mode: 'idle' = bergoyang pelan menunggu, 'dance' = menari mengikuti tempo (beatMs).
// `bounce` berganti nilai setiap pindah chord → maskot melompat kecil.
export default function Mascot({ mode = 'idle', beatMs = 750, bounce = 0, className = '' }) {
  return (
    <div className={`mascot ${mode} ${className}`} style={{ '--beat': `${beatMs}ms` }} aria-hidden>
      <svg width="185" height="279" viewBox="0 0 185 279" fill="none" overflow="visible">
        <ellipse className="m-shadow" cx="51.94" cy="269" rx="39.5" ry="9.41" fill="#1D1B20" fillOpacity="0.16" />
        <g key={bounce} className="m-hop">
          <g className="m-legs">
            <path className="m-leg-l" d="M37.49 210.68V260.42L24.32 265.24" strokeWidth="7.69" strokeLinecap="round" stroke="#1A1A1A" />
            <path className="m-leg-r" d="M69.47 210.68V260.42L56.3 265.24" strokeWidth="7.69" strokeLinecap="round" stroke="#1A1A1A" />
          </g>
          <g className="m-body">
            <path className="m-arm-l" d="M11.84 167.42C6.61 178.03 -1.36 206.79 8.59 236.97" strokeWidth="7.69" strokeLinecap="round" stroke="#1A1A1A" />
            <path d="M172.42 34.03C130.61 45.09 93.86 15.95 80.7 0C102.89 85.92 100.61 119.46 96.7 125.48C18.85 52.11 -48.33 199.92 50.84 211.62C130.19 220.98 126.56 118.39 114.83 65.93C137.87 86.35 170.64 82.24 184.15 77.63L172.42 34.03Z" fill="#2391FF" />
            <g className="m-eyes">
              <ellipse cx="34.98" cy="155.32" rx="4.61" ry="9.23" fill="#1A1A1A" />
              <ellipse cx="58.05" cy="154.55" rx="4.61" ry="10" fill="#1A1A1A" />
            </g>
            <path className="m-arm-r" d="M90.15 168.1C96.14 178.3 106.18 206.4 98.46 237.23" strokeWidth="7.69" strokeLinecap="round" stroke="#1A1A1A" />
          </g>
        </g>
      </svg>
    </div>
  )
}
