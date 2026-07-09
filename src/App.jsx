import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeComponent from './components/pages/Home/HomeComponent'
import ReservaComponent from './components/pages/Reserva/ReservaComponent'
import PanelComponent from './components/pages/Panel/PanelComponent'
import { RESERVAS_ONLINE } from './data/features'

/**
 * Enrutado de la web.
 *  - /         → web pública (Fase 1)
 *  - /reserva        → reserva de citas online (Fase 2, solo si RESERVAS_ONLINE)
 *  - /admin (/panel) → panel del barbero (Fase 3)
 *
 * Con la reserva online desactivada (RESERVAS_ONLINE = false), /reserva
 * redirige a la home para que nadie llegue al flujo por URL.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route
          path="/reserva"
          element={RESERVAS_ONLINE ? <ReservaComponent /> : <Navigate to="/" replace />}
        />
        <Route path="/admin" element={<PanelComponent />} />
        <Route path="/panel" element={<PanelComponent />} />
      </Routes>
    </BrowserRouter>
  )
}
