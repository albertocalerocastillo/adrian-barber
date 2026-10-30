// #region Imports
import { lazy, Suspense } from 'react'
import type { FunctionComponent } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import HomeComponent from './components/pages/Home/HomeComponent'
import NotFoundComponent from './components/pages/NotFound/NotFoundComponent'
import LegalComponent from './components/pages/Legal/LegalComponent'
import { RESERVAS_ONLINE } from './data/features'
import { RouteEnum } from './services/enums/RouteEnum'
import { PaginaLegalEnum } from './services/enums/PaginaLegalEnum'
// #endregion

// #region Páginas con carga diferida
// La reserva y el panel van en su propio paquete: quien entra a la home (casi
// todo el mundo) no se descarga el panel del barbero.
const ReservaComponent = lazy(() => import('./components/pages/Booking/BookingComponent'))
const PanelComponent = lazy(() => import('./components/pages/Panel/PanelComponent'))
// #endregion

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
const App: FunctionComponent = () => {
  // #region Renderizado
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-tinta" />}>
            <Routes>
              <Route path={RouteEnum.Home} element={<HomeComponent />} />
              <Route
                path={RouteEnum.Booking}
                element={RESERVAS_ONLINE ? <ReservaComponent /> : <Navigate to={RouteEnum.Home} replace />}
              />
              <Route path={RouteEnum.Admin} element={<PanelComponent />} />
              <Route path={RouteEnum.Panel} element={<PanelComponent />} />
              <Route path={RouteEnum.LegalNotice} element={<LegalComponent tipo={PaginaLegalEnum.AvisoLegal} />} />
              <Route path={RouteEnum.Privacy} element={<LegalComponent tipo={PaginaLegalEnum.Privacidad} />} />
              <Route path={RouteEnum.Cookies} element={<LegalComponent tipo={PaginaLegalEnum.Cookies} />} />
              {/* Comodín: sin esto, cualquier URL rara mostraba una página en blanco. */}
              <Route path={RouteEnum.NotFound} element={<NotFoundComponent />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  )
  // #endregion
}

export default App
