import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeComponent from './components/pages/Home/HomeComponent'
import ReservaComponent from './components/pages/Reserva/ReservaComponent'
import PanelComponent from './components/pages/Panel/PanelComponent'

/**
 * Enrutado de la web.
 *  - /         → web pública (Fase 1)
 *  - /reserva        → reserva de citas online (Fase 2)
 *  - /admin (/panel) → panel del barbero (Fase 3)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/reserva" element={<ReservaComponent />} />
        <Route path="/admin" element={<PanelComponent />} />
        <Route path="/panel" element={<PanelComponent />} />
      </Routes>
    </BrowserRouter>
  )
}
