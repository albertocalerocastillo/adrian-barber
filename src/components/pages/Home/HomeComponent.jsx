import NavComponent from '../../layout/Nav/NavComponent'
import FooterComponent from '../../layout/Footer/FooterComponent'
import HeroComponent from '../../sections/Hero/HeroComponent'
import CintaComponent from '../../sections/Cinta/CintaComponent'
import ServiciosComponent from '../../sections/Servicios/ServiciosComponent'
import SobreMiComponent from '../../sections/SobreMi/SobreMiComponent'
import GaleriaComponent from '../../sections/Galeria/GaleriaComponent'
import ResenasComponent from '../../sections/Resenas/ResenasComponent'
import HorarioComponent from '../../sections/Horario/HorarioComponent'
import UbicacionComponent from '../../sections/Ubicacion/UbicacionComponent'
import FaqComponent from '../../sections/Faq/FaqComponent'
import CtaFinalComponent from '../../sections/CtaFinal/CtaFinalComponent'
import FloatingActionsComponent from '../../ui/FloatingActions/FloatingActionsComponent'
import ProgresoScrollComponent from '../../ui/ProgresoScroll/ProgresoScrollComponent'

/**
 * Página pública (landing). El orden de secciones alterna fondos claros (hueso)
 * y oscuros (tinta) para dar ritmo visual, y acaba con un último empujón
 * (CtaFinal) antes del pie.
 */
export default function HomeComponent() {
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <ProgresoScrollComponent />
      <NavComponent />
      <main>
        <HeroComponent />
        <CintaComponent />
        <ServiciosComponent />
        <SobreMiComponent />
        <GaleriaComponent />
        <ResenasComponent />
        <HorarioComponent />
        <UbicacionComponent />
        <FaqComponent />
        <CtaFinalComponent />
      </main>
      <FooterComponent />
      <FloatingActionsComponent />
    </div>
  )
}
