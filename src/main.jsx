import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografías servidas desde la propia web (no desde Google Fonts): así el
// navegador del visitante no le manda su IP a Google al cargar la página,
// que es lo que el RGPD pide evitar sin consentimiento.
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/playfair-display/wght-italic.css'
import '@fontsource-variable/lora'
import '@fontsource-variable/lora/wght-italic.css'
import './theme/theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
