import NavComponent from '../../layout/Nav/NavComponent'
import FooterComponent from '../../layout/Footer/FooterComponent'
import HeroComponent from '../../sections/Hero/HeroComponent'
import ServiciosComponent from '../../sections/Servicios/ServiciosComponent'
import SobreMiComponent from '../../sections/SobreMi/SobreMiComponent'
import GaleriaComponent from '../../sections/Galeria/GaleriaComponent'
import HorarioComponent from '../../sections/Horario/HorarioComponent'
import UbicacionComponent from '../../sections/Ubicacion/UbicacionComponent'
import FloatingActionsComponent from '../../ui/FloatingActions/FloatingActionsComponent'

/**
 * Página pública (landing). El orden de secciones alterna fondos claros (hueso)
 * y oscuros (tinta) para dar ritmo visual.
 */
export default function HomeComponent() {
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
