// #region Imports
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Scissors, BellRing } from 'lucide-react'
import RevealComponent from '../../core/Reveal/RevealComponent'
import { RESERVAS_ONLINE, reservaEmpezada, inicioReservas } from '../../../data/features'
import { startOfDay } from '../../../utils/dates'
// #endregion

// #region Constantes
// Milisegundos de un día.
const MS_DIA = 24 * 60 * 60 * 1000

// Retardo entre la entrada de un paso y el siguiente, en ms.
const RETARDO_PASO_MS = 120

// Los tres pasos de la reserva, contados como se viven.
const PASOS = [
  { Icono: Scissors, titulo: 'Elige qué te hacemos', texto: 'Corte con cejas, barba y diseños, con su precio a la vista.' },
  { Icono: CalendarDays, titulo: 'Coge día y hora', texto: 'Solo salen los huecos libres de verdad, al momento.' },
  { Icono: BellRing, titulo: 'Y listo', texto: 'Adrián recibe tu cita y tú la guardas en tu calendario con un toque.' },
]
// #endregion

/** Días que faltan para que empiece la reserva online (0 si ya ha empezado). */
const diasHastaInicio = (ahora: Date = new Date()): number =>
  Math.max(0, Math.ceil((inicioReservas().getTime() - startOfDay(ahora).getTime()) / MS_DIA))

/**
 * Anuncio de la RESERVA ONLINE: una tarjeta oscura que salta a la vista entre
 * los servicios y "Sobre mí". Antes del 1 de enero la presenta como novedad,
 * con la cuenta atrás y el aviso de que ya se puede coger hueco para enero;
 * después se queda como recordatorio de lo fácil que es reservar.
 */
const OnlineBookingComponent: FunctionComponent = () => {
  // #region Declaraciones, variables y hooks
  if (!RESERVAS_ONLINE) return null
  const empezada = reservaEmpezada()
  const dias = diasHastaInicio()
  // #endregion

  // #region Renderizado
  return (
    <section aria-labelledby="reserva-online-titulo" className="bg-hueso px-5 pb-24 md:px-8 md:pb-32">
      <RevealComponent className="mx-auto max-w-6xl">
        <div className="pizarra relative overflow-hidden rounded-[2rem] px-6 py-12 text-hueso shadow-2xl shadow-tinta/30 ring-1 ring-acento/25 sm:px-10 md:px-14 md:py-16">
          {/* Halo dorado de fondo. */}
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-acento/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-acento/10 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-acento/40 bg-acento/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-acento">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acento opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-acento" />
                </span>
                {empezada ? 'Reserva online' : 'Novedad'}
              </p>
              <h2 id="reserva-online-titulo" className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
                {empezada ? 'Tu cita en 30 segundos' : 'Reserva online, sin llamar ni escribir'}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-hueso/75 lg:mx-0">
                {empezada
                  ? 'Elige servicio, día y hora desde el móvil, a cualquier hora. Sin esperar respuesta.'
                  : 'A partir del 1 de enero coges tu cita desde el móvil, a cualquier hora. Y ya puedes reservar tu hueco para enero.'}
              </p>

              {!empezada && dias > 0 && (
                <p className="mt-6 flex items-baseline justify-center gap-2 lg:justify-start">
                  <span className="font-display text-5xl font-bold tabular-nums text-acento">{dias}</span>
                  <span className="text-sm uppercase tracking-widest text-hueso/60">{dias === 1 ? 'día para empezar' : 'días para empezar'}</span>
                </p>
              )}

              <Link
                to="/reserva"
                className="group mt-8 inline-flex items-center gap-3 bg-acento px-8 py-4 text-sm font-semibold uppercase tracking-widest text-tinta shadow-lg shadow-acento/25 transition-colors hover:bg-acento-claro"
              >
                {empezada ? 'Reservar ahora' : 'Coger mi hueco'}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ol className="space-y-4">
              {PASOS.map(({ Icono, titulo, texto }, i) => (
                <RevealComponent as="li" key={titulo} delay={i * RETARDO_PASO_MS}>
                  <div className="flex items-start gap-5 rounded-2xl border border-hueso/10 bg-hueso/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-acento/40">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-acento/15 text-acento">
                      <Icono size={22} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-acento text-[0.65rem] font-bold text-tinta">
                        {i + 1}
                      </span>
                    </span>
                    <div>
                      <p className="font-display text-xl font-semibold">{titulo}</p>
                      <p className="mt-1 text-sm leading-relaxed text-hueso/65">{texto}</p>
                    </div>
                  </div>
                </RevealComponent>
              ))}
            </ol>
          </div>
        </div>
      </RevealComponent>
    </section>
  )
  // #endregion
}

export default OnlineBookingComponent
