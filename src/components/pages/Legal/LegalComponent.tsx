// #region Imports
import { useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrandLogoComponent from '../../core/BrandLogo/BrandLogoComponent'
import LegalNoticeComponent from './LegalNotice/LegalNoticeComponent'
import PrivacyComponent from './Privacy/PrivacyComponent'
import CookiesComponent from './Cookies/CookiesComponent'
import { NEGOCIO, LEGAL } from '../../../data/contact'
import { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'
import { PaginaLegalEnum } from '../../../services/enums/PaginaLegalEnum'
import { RouteEnum } from '../../../services/enums/RouteEnum'
import type { ILegalProps } from './ILegalProps'
// #endregion

// #region Constantes
/** Página legal: título, dirección y contenido. */
interface IPaginaLegal {
  /** Título de la página (también el de la pestaña). */
  titulo: string;
  /** Dirección de la página. */
  ruta: RouteEnum;
  /** Contenido de la página. */
  Contenido: FunctionComponent;
}

// Cada página legal con su título.
const PAGINAS: Record<PaginaLegalEnum, IPaginaLegal> = {
  [PaginaLegalEnum.AvisoLegal]: { titulo: 'Aviso legal', ruta: RouteEnum.LegalNotice, Contenido: LegalNoticeComponent },
  [PaginaLegalEnum.Privacidad]: { titulo: 'Política de privacidad', ruta: RouteEnum.Privacy, Contenido: PrivacyComponent },
  [PaginaLegalEnum.Cookies]: { titulo: 'Política de cookies', ruta: RouteEnum.Cookies, Contenido: CookiesComponent },
}
// #endregion

/**
 * Páginas legales: aviso legal (LSSI), privacidad (RGPD) y cookies.
 * Los datos del titular salen de LEGAL (data/contact.ts), para cambiarlos
 * en un solo sitio. Están escritas en claro, sin jerga, y describen lo que
 * la web hace DE VERDAD (si algún día se añade analítica o publicidad, hay
 * que actualizarlas y poner un aviso de cookies).
 */
const LegalComponent: FunctionComponent<ILegalProps> = ({ tipo }) => {
  // #region Declaraciones, variables y hooks
  const { titulo, Contenido } = PAGINAS[tipo]
  const otrasPaginas = Object.values(PaginaLegalEnum).filter((clave) => clave !== tipo)

  useEffect(() => {
    const anterior = document.title
    document.title = `${titulo} · ${NEGOCIO.nombreCompleto}`
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      document.title = anterior
    }
  }, [titulo])
  // #endregion

  // #region Renderizado
  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="pizarra border-b border-acento/15">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to={RouteEnum.Home} aria-label="Volver al inicio">
            <BrandLogoComponent variant={BrandLogoVariantEnum.Monogram} className="h-9 w-auto" />
          </Link>
          <Link to={RouteEnum.Home} className="flex items-center gap-1.5 text-sm text-hueso/70 transition-colors hover:text-acento">
            <ArrowLeft size={16} /> Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <p className="text-xs tracking-kicker text-acento-oscuro">Información legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{titulo}</h1>
        <p className="mt-3 text-sm text-tinta/45">Última actualización: {LEGAL.actualizado}</p>

        <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed text-tinta/75 [&_a]:font-medium [&_a]:text-acento-oscuro [&_a]:underline [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-tinta [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1.5">
          <Contenido />
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-hueso-200 pt-6 text-sm" aria-label="Otras páginas legales">
          {otrasPaginas.map((clave) => (
            <Link key={clave} to={PAGINAS[clave].ruta} className="text-tinta/55 hover:text-acento-oscuro">
              {PAGINAS[clave].titulo}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
  // #endregion
}

export default LegalComponent
