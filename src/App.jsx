import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeComponent from './components/pages/Home/HomeComponent'
import ReservaComponent from './components/pages/Reserva/ReservaComponent'

/**
 * Enrutado de la web.
 *  - /         → web pública (Fase 1)
 *  - /reserva  → reserva de citas online (Fase 2)
 *  - /panel    → panel del barbero (Fase 3, pendiente)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/reserva" element={<ReservaComponent />} />
      </Routes>
    </BrowserRouter>
  )
}
