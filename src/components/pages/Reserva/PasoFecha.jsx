import { ArrowLeft, Loader2 } from 'lucide-react'
import { proximosDias, fechaCorta, diaAbierto, mismoDia } from '../../../utils/fechas'

const DIAS_A_MOSTRAR = 28

/**
 * Paso 2: elegir fecha. Muestra los próximos días; los días sin horario
 * (cerrados) salen deshabilitados. `horario` viene de Supabase (o estático).
 */
export default function PasoFecha({ fecha, horario, onElegir, onAtras }) {
  if (!horario) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-tinta/50">
        <Loader2 size={26} className="animate-spin" />
        <p className="text-sm">Cargando horario…</p>
      </div>
    )
  }
  const dias = proximosDias(DIAS_A_MOSTRAR)

  return (
    <div>
      <h2 className="mb-5 text-center font-display text-xl font-semibold">
        ¿Qué día te viene bien?
      </h2>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {dias.map((d) => {
          const abierto = diaAbierto(d, horario)
          const sel = fecha && mismoDia(fecha, d)
          const { diaSemana, dia, mes } = fechaCorta(d)
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={!abierto}
              onClick={() => onElegir(d)}
              className={`flex flex-col items-center rounded-xl border py-3 transition-all ${
                !abierto
                  ? 'cursor-not-allowed border-transparent bg-tinta/[0.03] text-tinta/25'
                  : sel
                    ? 'border-acento bg-acento/10 text-tinta'
                    : 'border-hueso-200 bg-white text-tinta hover:-translate-y-0.5 hover:border-acento/50 hover:shadow-md'
              }`}
            >
              <span className="text-xs capitalize">{diaSemana}</span>
              <span className="font-display text-2xl font-bold leading-tight">{dia}</span>
              <span className="text-[0.65rem] uppercase tracking-wide text-tinta/40">
                {abierto ? mes : 'Cerrado'}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onAtras}
        className="mt-8 flex items-center gap-1.5 text-sm text-tinta/60 transition-colors hover:text-tinta"
      >
        <ArrowLeft size={16} />
        Cambiar servicio
      </button>
    </div>
  )
}
