import NavComponent from './components/layout/Nav/NavComponent'
import FooterComponent from './components/layout/Footer/FooterComponent'
import HeroComponent from './components/sections/Hero/HeroComponent'
import ServiciosComponent from './components/sections/Servicios/ServiciosComponent'
import SobreMiComponent from './components/sections/SobreMi/SobreMiComponent'
import GaleriaComponent from './components/sections/Galeria/GaleriaComponent'
import HorarioComponent from './components/sections/Horario/HorarioComponent'
import UbicacionComponent from './components/sections/Ubicacion/UbicacionComponent'
import FloatingActionsComponent from './components/ui/FloatingActions/FloatingActionsComponent'

/**
 * Web pública de A.S Barbería (Fase 1).
 * El orden de las secciones alterna fondos claros (hueso) y oscuros (tinta)
 * para dar ritmo visual.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <NavComponent />
      <HeroComponent />
      <ServiciosComponent />
      <SobreMiComponent />
      <GaleriaComponent />
      <HorarioComponent />
      <UbicacionComponent />
      <FooterComponent />
      <FloatingActionsComponent />
    </div>
  )
}
