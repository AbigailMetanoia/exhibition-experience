import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { unlockAudioOnFirstGesture } from './audio/synth.js'
import { initMidi } from './audio/midi.js'

unlockAudioOnFirstGesture()
initMidi()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
