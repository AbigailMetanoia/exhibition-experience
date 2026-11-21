// Tile chord biru dengan "tepi bawah" 3D seperti di hi-fi.
// Nama chord panjang (mis. Cmaj7) otomatis memakai huruf lebih kecil agar muat.
export default function ChordTile({ name, size = 'sm', pressed = false }) {
  const long = name.length > 3 ? 'long' : name.length === 3 ? 'mid' : ''
  return <span className={`tile tile-${size} ${long} ${pressed ? 'pressed' : ''}`}>{name}</span>
}
