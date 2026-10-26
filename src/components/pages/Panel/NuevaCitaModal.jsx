import { useState, useEffect } from 'react'
import { Loader2, CalendarX } from 'lucide-react'
import Hoja from './Hoja'
import { Campo, BotonPrincipal, AtajosFecha, claseInput } from './Controles'
import { generarRejilla, sumarMin } from '../../../utils/disponibilidad'
import { hora as fmtHora, inicioDia, aInputDate } from '../../../utils/fechas'
import { listarCitas, listarBloqueos, crearCitaManual } from '../../../lib/panel'
import { getHorario, getServicios } from '../../../lib/config'
import { ICONOS } from '../../../theme/icons'

/**
 * Alta manual de cita desde el panel (cliente que llama, que pasa por la
 * puerta o que escribe por WhatsApp). Todo se elige tocando: servicio,
 * día y hora; solo se escribe el nombre. Las horas salen del motor de huecos,
 * así que nunca ofrece una que ya esté ocupada.
 *
 * Props: fechaInicial (Date), horaInicial ("HH:MM", opcional: viene de pulsar
 * un hueco libre), onClose, onCreada(texto del aviso).
 */
export default function NuevaCitaModal({ fechaInicial, horaInicial, onClose, onCreada }) {
  const [servicios, setServicios] = useState([])
  const [servicioId, setServicioId] = useState('')
  const [fechaStr, setFechaStr] = useState(aInputDate(fechaInicial || new Date()))
  const [rejilla, setRejilla] = useState(null)
  const [horaISO, setHoraISO] = useState('')
  const [nombre, setNombre] = useState('')
  const [movil, setMovil] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [horario, setHorario] = useState(null)

  const servicio = servicios.find((s) => String(s.id) === String(servicioId))

  // Carga horario y servicios una vez (para citas manuales se ofrecen los activos).
  useEffect(() => {
    let vivo = true
    Promise.all([getHorario(), getServicios()]).then(([h, ss]) => {
      if (!vivo) return
      const activos = ss.filter((s) => s.activo !== false)
      setHorario(h)
      setServicios(activos)
      setServicioId(activos[0]?.id ?? '')
    })
    return () => {
      vivo = false
    }
  }, [])

  // Recalcula huecos libres cuando cambia servicio, fecha u horario.
  useEffect(() => {
    const svc = servicios.find((s) => String(s.id) === String(servicioId))
    if (!svc || !horario) return
    const f = new Date(`${fechaStr}T00:00:00`)
    let vivo = true
    const desde = inicioDia(f)
    const hasta = sumarMin(desde, 24 * 60)
    Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)]).then(([citas, bloqueos]) => {
      if (!vivo) return
      const libres = generarRejilla({
        fecha: f,
        duracionMin: svc.duracion,
        horario,
        citas: citas.filter((c) => c.estado !== 'cancelada'),
        bloqueos,
        ahora: new Date(0), // en el panel se permite también hoy más temprano
        granularidadMin: 15,
      }).filter((s) => s.estado === 'libre')
      setRejilla(libres)
      // Si se vino desde un hueco libre, esa hora sale ya marcada.
      const preferida = horaInicial && libres.find((s) => fmtHora(s.inicio) === horaInicial)
      setHoraISO(preferida ? preferida.inicio.toISOString() : '')
    })
    return () => {
      vivo = false
    }
  }, [servicioId, fechaStr, horario, servicios, horaInicial])

  const cambiarFecha = (v) => {
    setRejilla(null)
    setFechaStr(v)
  }

  async function onGuardar(e) {
    e?.preventDefault()
    if (guardando) return
    if (!servicio) return setError('Elige un servicio.')
    if (!horaISO) return setError('Elige una hora.')
    if (nombre.trim().length < 2) return setError('Escribe el nombre del cliente.')
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
      onCreada(`Cita de ${nombre.trim().split(' ')[0]} a las ${fmtHora(inicio)} guardada`)
      onClose()
    } else {
      setError(res.error)
    }
  }

  // Mañana y tarde por separado: más fácil de encontrar la hora.
  const manana = rejilla?.filter((s) => s.inicio.getHours() < 15) ?? []
  const tarde = rejilla?.filter((s) => s.inicio.getHours() >= 15) ?? []

  return (
    <Hoja
      titulo="Nueva cita"
      subtitulo="Para quien llama o pasa por la puerta."
      onCerrar={onClose}
      pie={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <BotonPrincipal type="button" onClick={onGuardar} cargando={guardando} className="w-full">
            {horaISO ? `Guardar cita a las ${fmtHora(new Date(horaISO))}` : 'Guardar cita'}
          </BotonPrincipal>
        </div>
      }
    >
      <form onSubmit={onGuardar} className="space-y-6">
        <Campo etiqueta="Servicio">
          <div className="grid gap-2 sm:grid-cols-2">
            {servicios.map((s) => {
              const Icono = ICONOS[s.icono] || ICONOS.Scissors
              const elegido = String(s.id) === String(servicioId)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServicioId(s.id)}
                  aria-pressed={elegido}
                  className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                    elegido ? 'bg-tinta text-hueso shadow-lg' : 'bg-white ring-1 ring-hueso-200 hover:ring-tinta/30'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${elegido ? 'bg-acento text-tinta' : 'bg-tinta/5 text-acento-oscuro'}`}>
                    <Icono size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{s.nombre}</span>
                    <span className={`text-xs ${elegido ? 'text-hueso/60' : 'text-tinta/50'}`}>
                      {s.duracion} min · {s.precio} €
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </Campo>

        <Campo etiqueta="Día">
          <AtajosFecha valor={fechaStr} onCambio={cambiarFecha} />
        </Campo>

        <Campo etiqueta="Hora">
          {rejilla === null ? (
            <p className="flex items-center gap-2 py-3 text-sm text-tinta/50">
              <Loader2 size={16} className="animate-spin" /> Buscando huecos libres…
            </p>
          ) : rejilla.length === 0 ? (
            <p className="flex items-center gap-2 rounded-2xl bg-tinta/5 px-4 py-4 text-sm text-tinta/60">
              <CalendarX size={18} /> No hay huecos libres ese día. Prueba otro.
            </p>
          ) : (
            <div className="space-y-3">
              {[
                ['Mañana', manana],
                ['Tarde', tarde],
              ].map(
                ([titulo, horas]) =>
                  horas.length > 0 && (
                    <div key={titulo}>
                      <p className="mb-1.5 text-xs text-tinta/40">{titulo}</p>
                      <div className="grid grid-cols-4 gap-1.5 min-[400px]:grid-cols-5 sm:grid-cols-6">
                        {horas.map((s) => {
                          const iso = s.inicio.toISOString()
                          const elegida = iso === horaISO
                          return (
                            <button
                              key={iso}
                              type="button"
                              onClick={() => setHoraISO(iso)}
                              aria-pressed={elegida}
                              className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition-all active:scale-95 ${
                                elegida ? 'bg-acento text-tinta shadow-md shadow-acento/30' : 'bg-white ring-1 ring-hueso-200 hover:ring-acento'
                              }`}
                            >
                              {fmtHora(s.inicio)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="off"
              className={claseInput}
              placeholder="Nombre del cliente"
            />
          </Campo>
          <Campo etiqueta="Móvil (opcional)">
            <input
              value={movil}
              onChange={(e) => setMovil(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="off"
              className={claseInput}
              placeholder="600 000 000"
            />
          </Campo>
        </div>
      </form>
    </Hoja>
  )
}
