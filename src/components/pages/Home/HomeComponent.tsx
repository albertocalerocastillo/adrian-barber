// #region Imports
import type { FunctionComponent } from 'react'
import NavComponent from '../../layout/Nav/NavComponent'
import FooterComponent from '../../layout/Footer/FooterComponent'
import HeroComponent from '../../sections/Hero/HeroComponent'
import RibbonComponent from '../../sections/Ribbon/RibbonComponent'
import ServicesComponent from '../../sections/Services/ServicesComponent'
import AboutMeComponent from '../../sections/AboutMe/AboutMeComponent'
import GalleryComponent from '../../sections/Gallery/GalleryComponent'
import ReviewsComponent from '../../sections/Reviews/ReviewsComponent'
import OpeningHoursComponent from '../../sections/OpeningHours/OpeningHoursComponent'
import LocationComponent from '../../sections/Location/LocationComponent'
import FaqComponent from '../../sections/Faq/FaqComponent'
import FinalCtaComponent from '../../sections/FinalCta/FinalCtaComponent'
import FloatingActionsComponent from '../../core/FloatingActions/FloatingActionsComponent'
import ScrollProgressComponent from '../../core/ScrollProgress/ScrollProgressComponent'
// #endregion

/**
 * Página pública (landing). El orden de secciones alterna fondos claros (hueso)
 * y oscuros (tinta) para dar ritmo visual, y acaba con un último empujón
 * (CtaFinal) antes del pie.
 *
 * overflow-x-clip: lo que entra animado desde un lado arranca fuera de su
 * sitio. Recortarlo en el <body> no basta en el móvil (Safari lo ignora y la
 * página se ensanchaba, con un hueco blanco a la derecha), así que se recorta
 * aquí. "clip" y no "hidden" para no romper los position: sticky.
 */
const HomeComponent: FunctionComponent = () => {
  // #region Renderizado
  return (
    <div className="min-h-screen overflow-x-clip bg-hueso text-tinta">
      <ScrollProgressComponent />
      <NavComponent />
      <main>
        <HeroComponent />
        <RibbonComponent />
        <ServicesComponent />
        <AboutMeComponent />
        <GalleryComponent />
        <ReviewsComponent />
        <OpeningHoursComponent />
        <LocationComponent />
        <FaqComponent />
        <FinalCtaComponent />
      </main>
      <FooterComponent />
      <FloatingActionsComponent />
    </div>
  )
  // #endregion
}

export default HomeComponent
