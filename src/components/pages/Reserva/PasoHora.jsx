import { useState, useEffect } from 'react'
import { ArrowLeft, CalendarX, Loader2 } from 'lucide-react'
import { HORARIO } from '../../../data/horarios'
import { getCitas } from '../../../lib/citas'
import { generarHuecos } from '../../../utils/disponibilidad'
import { fechaLarga, hora as fmtHora, inicioDia } from '../../../utils/fechas'

/**
 * Paso 3: elegir hora. Carga las citas ocupadas del día y calcula los huecos
 * libres según la duración del servicio (nunca solapes, nunca en pasado).
 */
export default function PasoHora({ servicio, fecha, onElegir, onAtras }) {
  const [cargando, setCargando] = useState(true)
  const [huecos, setHuecos] = useState([])

  useEffect(() => {
    let vivo = true
    const desde = inicioDia(fecha)
    const hasta = new Date(desde)
    hasta.setDate(desde.getDate() + 1)

    getCitas(desde, hasta).then((citas) => {
      if (!vivo) return
      const libres = generarHuecos({
        fecha,
        duracionMin: servicio.duracion,
        horario: HORARIO,
        citas,
        ahora: new Date(),
        granularidadMin: 15,
      })
      setHuecos(libres)
      setCargando(false)
    })

    return () => {
      vivo = false
    }
  }, [servicio, fecha])

  const manana = huecos.filter((h) => h.getHours() < 14)
  const tarde = huecos.filter((h) => h.getHours() >= 14)

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
      ) : huecos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-hueso-200 bg-white py-12 text-center">
          <CalendarX size={32} className="text-tinta/30" />
          <p className="font-medium">No quedan huecos ese día</p>
          <p className="max-w-xs text-sm text-tinta/50">
            Prueba con otra fecha; suele haber hueco enseguida.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {manana.length > 0 && (
            <FranjaHoras titulo="Mañana" huecos={manana} onElegir={onElegir} />
          )}
          {tarde.length > 0 && (
            <FranjaHoras titulo="Tarde" huecos={tarde} onElegir={onElegir} />
          )}
        </div>
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

function FranjaHoras({ titulo, huecos, onElegir }) {
  return (
    <div>
      <p className="mb-3 text-xs tracking-kicker text-tinta/40">{titulo}</p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {huecos.map((h) => (
          <button
            key={h.toISOString()}
            type="button"
            onClick={() => onElegir(h)}
            className="rounded-xl border border-hueso-200 bg-white py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:border-acento hover:bg-acento/10 hover:shadow-md"
          >
            {fmtHora(h)}
          </button>
        ))}
      </div>
    </div>
  )
}
