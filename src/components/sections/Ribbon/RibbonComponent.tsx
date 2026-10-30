// #region Imports
import type { FunctionComponent } from 'react'
import { Scissors } from 'lucide-react'
import MarqueeComponent from '../../core/Marquee/MarqueeComponent'
import { NEGOCIO } from '../../../data/contact'
import { SERVICIOS } from '../../../data/services'
// #endregion

// #region Constantes
// Id del servicio de corte en los datos estáticos.
const ID_SERVICIO_CORTE = 'corte'
const PRECIO_CORTE = SERVICIOS.find((servicio) => servicio.id === ID_SERVICIO_CORTE)?.precio

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

// Velocidad de la cinta (% del ancho de una copia por segundo).
const VELOCIDAD_CINTA = 4
// #endregion

/**
 * Cinta dorada entre el hero y los servicios. Separa las dos secciones con
 * movimiento y repite de un vistazo lo que se ofrece y a qué precio.
 */
const RibbonComponent: FunctionComponent = () => {
  // #region Renderizado
  return (
    <div className="relative z-10 -mt-px bg-acento py-4 text-tinta md:py-5">
      <p className="sr-only">{PALABRAS.join(' · ')}</p>
      <MarqueeComponent speed={VELOCIDAD_CINTA} className="font-display text-xl font-semibold italic md:text-3xl">
        {PALABRAS.map((palabra) => (
          <span key={palabra} aria-hidden="true" className="flex items-center whitespace-nowrap">
            <span className="px-6 md:px-9">{palabra}</span>
            <Scissors size={18} strokeWidth={2} className="shrink-0 -rotate-90 opacity-60" />
          </span>
        ))}
      </MarqueeComponent>
    </div>
  )
  // #endregion
}

export default RibbonComponent
