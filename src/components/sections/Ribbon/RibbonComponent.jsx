// #region Imports
import { Scissors } from 'lucide-react'
import MarqueeComponent from '../../core/Marquee/MarqueeComponent'
import { NEGOCIO } from '../../../data/contact'
import { SERVICIOS } from '../../../data/services'
// #endregion

const PRECIO_CORTE = SERVICIOS.find((s) => s.id === 'corte')?.precio

// Lo que hace, en una línea que no para. Solo datos reales.
const PALABRAS = [
  `Corte ${PRECIO_CORTE} €`,
  'Cejas',
  'Barba',
  'Diseños',
  'Mechas',
  'Tinte',
  NEGOCIO.localidad,
]

/**
 * Cinta dorada entre el hero y los servicios. Separa las dos secciones con
 * movimiento y repite de un vistazo lo que se ofrece y a qué precio.
 */
const RibbonComponent = () => {
  // #region Renderizado
  return (
    <div className="relative z-10 -mt-px bg-acento py-4 text-tinta md:py-5">
      <p className="sr-only">{PALABRAS.join(' · ')}</p>
      <MarqueeComponent speed={4} className="font-display text-xl font-semibold italic md:text-3xl">
        {PALABRAS.map((p) => (
          <span key={p} aria-hidden="true" className="flex items-center whitespace-nowrap">
            <span className="px-6 md:px-9">{p}</span>
            <Scissors size={18} strokeWidth={2} className="shrink-0 -rotate-90 opacity-60" />
          </span>
        ))}
      </MarqueeComponent>
    </div>
  )
  // #endregion
}

export default RibbonComponent
