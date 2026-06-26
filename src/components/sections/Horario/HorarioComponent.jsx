import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import { HORARIO } from '../../../data/horarios'
import { estadoNegocio, diaHoy, formatoTramos } from '../../../utils/horario'

/**
 * Tabla de horario semanal con el día de hoy resaltado y un badge en vivo
 * de "Abierto / Cerrado ahora".
 */
export default function HorarioComponent() {
  const [ahora, setAhora] = useState(() => new Date())

  // Refresca cada minuto para mantener el badge al día.
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const estado = estadoNegocio(HORARIO, ahora)
  const hoy = diaHoy(ahora)

  return (
    <section id="horario" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Cuándo venir" titulo="Horario" />

        {/* Badge de estado */}
        <RevealComponent className="mt-10 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              estado.abierto
                ? 'bg-green-100 text-green-800'
                : 'bg-tinta/5 text-tinta/70'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                estado.abierto ? 'bg-green-500' : 'bg-tinta/40'
              }`}
            />
            {estado.abierto
              ? `Abierto ahora · hasta las ${estado.cierraA}`
              : estado.abreA
                ? `Cerrado · abre ${estado.proximoDia ? estado.proximoDia.toLowerCase() : 'hoy'} a las ${estado.abreA}`
                : 'Cerrado'}
          </span>
        </RevealComponent>

        {/* Tabla de horario */}
        <RevealComponent delay={120} className="mt-8">
          <ul className="overflow-hidden rounded-2xl border border-hueso-200 bg-white">
            {HORARIO.map((d) => {
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
