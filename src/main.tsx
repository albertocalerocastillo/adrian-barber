// #region Imports
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
import App from './App'
// #endregion

// #region Constantes
// Id del contenedor de index.html donde se monta la app.
const ID_RAIZ = 'root'
// #endregion

const raiz = document.getElementById(ID_RAIZ)

if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
