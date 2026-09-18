import { Clock } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import EstadoBadgeComponent from '../../ui/EstadoBadge/EstadoBadgeComponent'
import { useEstadoNegocio } from '../../../hooks/useEstadoNegocio'
import { diaHoy, formatoTramos } from '../../../utils/horario'

/**
 * Tabla de horario semanal con el día de hoy resaltado y un badge en vivo
 * de "Abierto / Cerrado ahora".
 */
export default function HorarioComponent() {
  const { estado, horario, ahora } = useEstadoNegocio()
  const hoy = diaHoy(ahora)

  return (
    <section id="horario" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Cuándo venir" titulo="Horario" />

        {/* Badge de estado */}
        <RevealComponent className="mt-10 flex justify-center">
          <EstadoBadgeComponent estado={estado} />
        </RevealComponent>

        {/* Tabla de horario */}
        <RevealComponent delay={120} className="mt-8">
          <ul className="overflow-hidden border border-hueso-200 bg-white">
            {horario.map((d) => {
              const esHoy = d.dia === hoy
              const cerrado = d.tramos.length === 0
              return (
                <li
                  key={d.dia}
                  className={`flex items-center justify-between border-b border-hueso-200 px-5 py-4 text-sm last:border-b-0 ${
                    esHoy ? 'bg-acento/10' : ''
                  }`}
                >
                  <span
                    className={`flex items-center gap-2 font-medium ${
                      esHoy ? 'text-tinta' : 'text-tinta/80'
                    }`}
                  >
                    {esHoy && <Clock size={15} className="text-acento" />}
                    {d.nombre}
                  </span>
                  <span className={cerrado ? 'text-tinta/40' : 'text-tinta/70'}>
                    {formatoTramos(d.tramos)}
                  </span>
                </li>
              )
            })}
          </ul>
        </RevealComponent>

        <RevealComponent delay={200} className="mt-10 text-center">
          <CitaButtonComponent tamano="lg" />
        </RevealComponent>
      </div>
    </section>
  )
}
