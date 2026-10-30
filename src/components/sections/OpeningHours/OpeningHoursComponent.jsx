// #region Imports
import { Clock } from 'lucide-react'
import SectionHeadingComponent from '../../core/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../core/Reveal/RevealComponent'
import BookingButtonComponent from '../../core/BookingButton/BookingButtonComponent'
import StatusBadgeComponent from '../../core/StatusBadge/StatusBadgeComponent'
import { useBusinessStatus } from '../../../hooks/useBusinessStatus'
import { diaHoy, formatoTramos } from '../../../utils/schedule'
import { resumenHorario } from '../../../data/faq'
// #endregion

/**
 * Horario semanal con el día de hoy resaltado y un badge en vivo de
 * "Abierto / Cerrado ahora". En escritorio, el título y el botón a la
 * izquierda y la tabla a la derecha; en móvil, uno debajo de otro.
 */
const OpeningHoursComponent = () => {
  // #region Declaraciones, variables y hooks
  const { estado, horario, ahora } = useBusinessStatus()
  const hoy = diaHoy(ahora)
  const resumen = `${resumenHorario(horario)}. Escríbeme antes y te digo hueco.`
  // #endregion

  // #region Renderizado
  return (
    <section id="horario" className="overflow-x-clip bg-hueso py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="text-center lg:text-left">
          {/* Centrado en móvil y alineado a la izquierda en escritorio. El
              resumen sale del mismo horario que la tabla: no pueden
              contradecirse. */}
          <div className="lg:hidden">
            <SectionHeadingComponent kicker="Cuándo venir" titulo="Horario" texto={resumen} />
          </div>
          <div className="hidden lg:block">
            <SectionHeadingComponent
              kicker="Cuándo venir"
              titulo="Horario"
              texto={resumen}
              centrado={false}
            />
          </div>

          <RevealComponent delay={120} className="mt-8 flex justify-center lg:justify-start">
            <StatusBadgeComponent status={estado} />
          </RevealComponent>

          <RevealComponent delay={200} className="mt-8 hidden lg:block">
            <BookingButtonComponent tamano="lg" />
          </RevealComponent>
        </div>

        {/* Tabla de horario. */}
        <RevealComponent delay={120} desde="derecha">
          <ul className="overflow-hidden border border-hueso-200 bg-white shadow-xl shadow-tinta/5">
            {horario.map((d, i) => {
              const esHoy = d.dia === hoy
              const cerrado = d.tramos.length === 0
              return (
                <RevealComponent
                  as="li"
                  key={d.dia}
                  delay={200 + i * 50}
                  className={`relative flex items-center justify-between border-b border-hueso-200 px-6 py-4 text-sm last:border-b-0 md:py-5 md:text-base ${
                    esHoy ? 'bg-tinta text-hueso' : ''
                  }`}
                >
                  {esHoy && <span className="absolute inset-y-0 left-0 w-1 bg-acento" />}
                  <span
                    className={`flex items-center gap-2.5 font-medium ${
                      esHoy ? 'text-hueso' : 'text-tinta/80'
                    }`}
                  >
                    {esHoy && <Clock size={16} className="text-acento" />}
                    {d.nombre}
                    {esHoy && (
                      <span className="text-[0.6rem] uppercase tracking-widest text-acento">Hoy</span>
                    )}
                  </span>
                  <span
                    className={
                      esHoy
                        ? cerrado
                          ? 'text-hueso/50'
                          : 'font-semibold text-acento'
                        : cerrado
                          ? 'text-tinta/35'
                          : 'text-tinta/70'
                    }
                  >
                    {formatoTramos(d.tramos)}
                  </span>
                </RevealComponent>
              )
            })}
          </ul>
        </RevealComponent>

        <RevealComponent className="text-center lg:hidden">
          <BookingButtonComponent tamano="lg" />
        </RevealComponent>
      </div>
    </section>
  )
  // #endregion
}

export default OpeningHoursComponent
