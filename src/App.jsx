import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import HomeComponent from './components/pages/Home/HomeComponent'
import NoEncontradaComponent from './components/pages/NoEncontrada/NoEncontradaComponent'
import { RESERVAS_ONLINE } from './data/features'

// La reserva y el panel van en su propio paquete: quien entra a la home (casi
// todo el mundo) no se descarga el panel del barbero.
const ReservaComponent = lazy(() => import('./components/pages/Reserva/ReservaComponent'))
const PanelComponent = lazy(() => import('./components/pages/Panel/PanelComponent'))

/**
 * Enrutado de la web.
 *  - /         → web pública (Fase 1)
 *  - /reserva        → reserva de citas online (Fase 2, solo si RESERVAS_ONLINE)
 *  - /admin (/panel) → panel del barbero (Fase 3)
 *
 * Con la reserva online desactivada (RESERVAS_ONLINE = false), /reserva
 * redirige a la home para que nadie llegue al flujo por URL.
 *
 * Motion para toda la web: LazyMotion carga solo lo que se usa y MotionConfig
 * respeta la opción "reducir movimiento" del sistema.
 */
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-tinta" />}>
            <Routes>
              <Route path="/" element={<HomeComponent />} />
              <Route
                path="/reserva"
                element={RESERVAS_ONLINE ? <ReservaComponent /> : <Navigate to="/" replace />}
              />
              <Route path="/admin" element={<PanelComponent />} />
              <Route path="/panel" element={<PanelComponent />} />
              {/* Comodín: sin esto, cualquier URL rara mostraba una página en blanco. */}
              <Route path="*" element={<NoEncontradaComponent />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  )
}
