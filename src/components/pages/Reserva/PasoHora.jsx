import { useState, useEffect } from 'react'
import { ArrowLeft, CalendarX, Loader2 } from 'lucide-react'
import { HORARIO } from '../../../data/horarios'
import { getCitas } from '../../../lib/citas'
import { generarRejilla } from '../../../utils/disponibilidad'
import { fechaLarga, hora as fmtHora, inicioDia } from '../../../utils/fechas'

/**
 * Paso 3: elegir hora. Carga las citas ocupadas del día y monta la rejilla de
 * horas según la duración del servicio. Las horas libres son pulsables; las
 * ocupadas salen en gris/tachadas (sensación de agenda llena). Nunca pasado.
 */
export default function PasoHora({ servicio, fecha, onElegir, onAtras }) {
  const [cargando, setCargando] = useState(true)
  const [rejilla, setRejilla] = useState([])

  useEffect(() => {
    let vivo = true
    const desde = inicioDia(fecha)
    const hasta = new Date(desde)
    hasta.setDate(desde.getDate() + 1)

    getCitas(desde, hasta).then((citas) => {
      if (!vivo) return
      const slots = generarRejilla({
        fecha,
        duracionMin: servicio.duracion,
        horario: HORARIO,
        citas,
        ahora: new Date(),
        granularidadMin: 15,
      })
      setRejilla(slots)
      setCargando(false)
    })

    return () => {
      vivo = false
    }
  }, [servicio, fecha])

  const manana = rejilla.filter((s) => s.inicio.getHours() < 14)
  const tarde = rejilla.filter((s) => s.inicio.getHours() >= 14)
  const hayLibres = rejilla.some((s) => s.estado === 'libre')

  return (
    <div>
      <h2 className="text-center font-display text-xl font-semibold capitalize">
        {fechaLarga(fecha)}
      </h2>
      <p className="mb-6 text-center text-sm text-tinta/50">
        {servicio.nombre} · {servicio.duracion} min · {servicio.precio} €
      </p>

      {cargando ? (
        <div className="flex flex-col items-center gap-3 py-12 text-tinta/50">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Buscando huecos libres…</p>
        </div>
      ) : rejilla.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-hueso-200 bg-white py-12 text-center">
          <CalendarX size={32} className="text-tinta/30" />
          <p className="font-medium">Ese día no hay horario</p>
          <p className="max-w-xs text-sm text-tinta/50">Prueba con otra fecha.</p>
        </div>
      ) : (
        <>
          {!hayLibres && (
            <p className="mb-5 rounded-xl bg-tinta/5 px-4 py-3 text-center text-sm text-tinta/70">
              Día completo 😮‍💨 — prueba con otra fecha, suele liberarse hueco.
            </p>
          )}
          <div className="space-y-6">
            {manana.length > 0 && (
              <FranjaHoras titulo="Mañana" slots={manana} onElegir={onElegir} />
            )}
            {tarde.length > 0 && (
              <FranjaHoras titulo="Tarde" slots={tarde} onElegir={onElegir} />
            )}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onAtras}
        className="mt-8 flex items-center gap-1.5 text-sm text-tinta/60 transition-colors hover:text-tinta"
      >
        <ArrowLeft size={16} />
        Cambiar fecha
      </button>
    </div>
  )
}

function FranjaHoras({ titulo, slots, onElegir }) {
  return (
    <div>
      <p className="mb-3 text-xs tracking-kicker text-tinta/40">{titulo}</p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {slots.map((s) =>
          s.estado === 'libre' ? (
            <button
              key={s.inicio.toISOString()}
              type="button"
              onClick={() => onElegir(s.inicio)}
              className="rounded-xl border border-hueso-200 bg-white py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:border-acento hover:bg-acento/10 hover:shadow-md"
            >
              {fmtHora(s.inicio)}
            </button>
          ) : (
            <span
              key={s.inicio.toISOString()}
              aria-disabled="true"
              title="Ocupado"
              className="cursor-not-allowed rounded-xl border border-transparent bg-tinta/[0.04] py-3 text-center font-medium text-tinta/30 line-through"
            >
              {fmtHora(s.inicio)}
            </span>
          )
        )}
      </div>
    </div>
  )
}
