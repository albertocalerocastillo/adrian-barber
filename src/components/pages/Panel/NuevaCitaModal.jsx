import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { SERVICIOS } from '../../../data/servicios'
import { generarRejilla, sumarMin } from '../../../utils/disponibilidad'
import { hora as fmtHora, inicioDia } from '../../../utils/fechas'
import { listarCitas, listarBloqueos, crearCitaManual } from '../../../lib/panel'
import { getHorario } from '../../../lib/config'

/** Devuelve "YYYY-MM-DD" en local para el <input type=date>. */
function aInputDate(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Alta manual de cita desde el panel. Reutiliza el motor de huecos para no
 * ofrecer horas ocupadas. Sirve para migrar la agenda y para citas por
 * teléfono/presencial.
 */
export default function NuevaCitaModal({ fechaInicial, onClose, onCreada }) {
  const [servicioId, setServicioId] = useState(SERVICIOS[0]?.id || '')
  const [fechaStr, setFechaStr] = useState(aInputDate(fechaInicial || new Date()))
  const [rejilla, setRejilla] = useState([])
  const [horaISO, setHoraISO] = useState('')
  const [nombre, setNombre] = useState('')
  const [movil, setMovil] = useState('')
  const [cargandoHuecos, setCargandoHuecos] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [horario, setHorario] = useState(null)

  const servicio = SERVICIOS.find((s) => s.id === servicioId)

  // Carga el horario una vez.
  useEffect(() => {
    let vivo = true
    getHorario().then((h) => {
      if (vivo) setHorario(h)
    })
    return () => {
      vivo = false
    }
  }, [])

  // Recalcula huecos libres cuando cambia servicio, fecha u horario.
  useEffect(() => {
    const svc = SERVICIOS.find((s) => s.id === servicioId)
    if (!svc || !horario) return
    const f = new Date(`${fechaStr}T00:00:00`)
    let vivo = true
    const desde = inicioDia(f)
    const hasta = sumarMin(desde, 24 * 60)
    Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)]).then(
      ([citas, bloqueos]) => {
        if (!vivo) return
        const libres = generarRejilla({
          fecha: f,
          duracionMin: svc.duracion,
          horario,
          citas: citas.filter((c) => c.estado !== 'cancelada'),
          bloqueos,
          ahora: new Date(0), // en el panel permitimos también hoy más temprano
          granularidadMin: 15,
        }).filter((s) => s.estado === 'libre')
        setRejilla(libres)
        setHoraISO('')
        setCargandoHuecos(false)
      }
    )
    return () => {
      vivo = false
    }
  }, [servicioId, fechaStr, horario])

  async function onGuardar(e) {
    e.preventDefault()
    if (guardando) return
    if (!servicio || !horaISO || nombre.trim().length < 2) {
      setError('Completa servicio, hora y nombre.')
      return
    }
    setGuardando(true)
    setError('')
    const inicio = new Date(horaISO)
    const res = await crearCitaManual({
      servicioId: servicio.id,
      servicioNombre: servicio.nombre,
      clienteNombre: nombre.trim(),
      clienteMovil: movil.replace(/\s+/g, ''),
      inicio,
      fin: sumarMin(inicio, servicio.duracion),
    })
    setGuardando(false)
    if (res.ok) {
      onCreada()
      onClose()
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-hueso p-6 text-tinta sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Nueva cita</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-tinta/50 hover:text-tinta">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onGuardar} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-tinta/70">Servicio</span>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
            >
              {SERVICIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} · {s.duracion} min · {s.precio} €
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-tinta/70">Fecha</span>
            <input
              type="date"
              value={fechaStr}
              onChange={(e) => setFechaStr(e.target.value)}
              className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-tinta/70">Hora</span>
            {cargandoHuecos ? (
              <p className="flex items-center gap-2 py-2 text-sm text-tinta/50">
                <Loader2 size={15} className="animate-spin" /> Calculando huecos…
              </p>
            ) : rejilla.length === 0 ? (
              <p className="py-2 text-sm text-tinta/50">No hay huecos libres ese día.</p>
            ) : (
              <select
                value={horaISO}
                onChange={(e) => setHoraISO(e.target.value)}
                className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
              >
                <option value="">Elige hora…</option>
                {rejilla.map((s) => (
                  <option key={s.inicio.toISOString()} value={s.inicio.toISOString()}>
                    {fmtHora(s.inicio)}
                  </option>
                ))}
              </select>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-tinta/70">Nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
                placeholder="Cliente"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-tinta/70">Móvil</span>
              <input
                value={movil}
                onChange={(e) => setMovil(e.target.value)}
                className="w-full rounded-xl border border-hueso-200 bg-white px-3 py-2.5 outline-none focus:border-acento"
                placeholder="(opcional)"
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={guardando}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-acento py-3 font-semibold text-tinta transition-colors hover:bg-acento-claro disabled:opacity-60"
          >
            {guardando && <Loader2 size={17} className="animate-spin" />}
            Guardar cita
          </button>
        </form>
      </div>
    </div>
  )
}
