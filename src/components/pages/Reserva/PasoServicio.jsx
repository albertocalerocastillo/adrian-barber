// #region Imports
import { m } from 'motion/react'
import { Clock, ChevronRight, Sparkles, MessageCircle } from 'lucide-react'
import { ICONOS } from '../../../theme/icons'
import { EASE_SUAVE } from '../../../theme/animacion'
import { WHATSAPP } from '../../../data/contacto'
// #endregion

/** "A", "A y B", "A, B y C". */
const enumerar = (nombres) =>
  nombres.length < 2 ? nombres.join('') : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`

/**
 * Paso 1: elegir servicio. Muestra los servicios activos con duración y precio.
 * Recibe la lista ya filtrada (activos) desde ReservaComponent; `null` mientras
 * se cargan de Supabase. `soloWhatsapp` son los que Adrián prefiere cerrar
 * hablando (mechas, tinte): no se reservan aquí, solo se avisa de cómo pedirlos.
 */
const PasoServicio = ({ servicios, servicio, onElegir, soloWhatsapp = [] }) => {
  // #region Declaraciones, variables y hooks
  if (servicios === null) {
    return (
      <div className="space-y-3" aria-label="Cargando servicios">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-tinta/[0.06]" />
        ))}
      </div>
    )
  }
  // #endregion

  // #region Renderizado
  return (
    <div>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold sm:text-3xl">¿Qué te hacemos?</h2>

      <div className="space-y-3">
        {servicios.map((s, i) => {
          const Icono = ICONOS[s.icono] || ICONOS.Scissors
          const sel = servicio?.id === s.id
          return (
            <m.button
              key={s.id}
              type="button"
              onClick={() => onElegir(s)}
              aria-pressed={sel}
              className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-acento hover:shadow-lg hover:shadow-tinta/5 active:scale-[0.99] sm:p-5 ${
                sel ? 'border-acento ring-2 ring-acento/25' : 'border-hueso-200'
              }`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: EASE_SUAVE }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tinta text-acento transition-colors group-hover:bg-acento group-hover:text-tinta">
                <Icono size={24} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                {s.destacado && (
                  <p className="mb-0.5 flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-acento-oscuro">
                    <Sparkles size={11} /> El más pedido
                  </p>
                )}
                <p className="font-display text-lg font-semibold leading-tight sm:text-xl">{s.nombre}</p>
                {s.descripcion && <p className="mt-0.5 line-clamp-2 text-sm text-tinta/55">{s.descripcion}</p>}
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-tinta/45">
                  <Clock size={13} />
                  {s.duracion} min
                </p>
              </div>
              <span className="flex shrink-0 items-baseline gap-0.5 font-display font-bold">
                <span className="text-3xl">{s.precio}</span>
                <span className="text-lg text-tinta/50">€</span>
              </span>
              <ChevronRight
                size={20}
                className="hidden shrink-0 text-tinta/25 transition-transform group-hover:translate-x-0.5 group-hover:text-acento sm:block"
              />
            </m.button>
          )
        })}
      </div>

      {soloWhatsapp.length > 0 && (
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            `Hola Adrián, me gustaría pedir cita para ${soloWhatsapp[0].nombre.toLowerCase()}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-tinta/15 p-4 text-sm text-tinta/60 transition-colors hover:border-acento hover:text-tinta"
        >
          <MessageCircle size={20} className="shrink-0 text-acento-oscuro" />
          <span>
            <strong className="font-semibold text-tinta">{enumerar(soloWhatsapp.map((s) => s.nombre))}</strong>: pídelo
            por WhatsApp y te busco el mejor hueco.
          </span>
        </a>
      )}
    </div>
  )
  // #endregion
}

export default PasoServicio
