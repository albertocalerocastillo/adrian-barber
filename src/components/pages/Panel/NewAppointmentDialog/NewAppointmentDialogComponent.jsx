// #region Imports
import { useState, useEffect } from 'react'
import { Repeat } from 'lucide-react'
import SheetComponent from '../Sheet/SheetComponent'
import TimePickerComponent from '../TimePicker/TimePickerComponent'
import { huecosDelDia } from '../agendaSlots'
import FieldComponent from '../Controls/Field/FieldComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import SwitchComponent from '../Controls/Switch/SwitchComponent'
import StepperComponent from '../Controls/Stepper/StepperComponent'
import { INPUT_CLASS_NAME } from '../Controls/controlClasses'
import { addMinutes } from '../../../../utils/availability'
import { formatTime as fmtHora, formatShortDate, toInputDate } from '../../../../utils/dates'
import { ICONS } from '../../../../theme/icons'
import { AgendaService } from '../../../../services/AgendaService'
import { ConfigurationService } from '../../../../services/ConfigurationService'
// #endregion

const SEMANAS_MIN = 2
const SEMANAS_MAX = 12
const DIAS_SEMANA = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']

/** La misma hora `n` semanas seguidas (con setDate, para no liarla con el cambio de hora). */
const semanasDesde = (inicio, n) => {
  return Array.from({ length: n }, (_, i) => {
    const result = new Date(inicio)
    result.setDate(inicio.getDate() + i * 7)
    return result
  })
}

const diaYMes = (d) => {
  const { dia, mes } = formatShortDate(d)
  return `${dia} ${mes}`
}

/**
 * Alta manual de cita desde el panel (cliente que llama, que pasa por la
 * puerta o que escribe por WhatsApp). Todo se elige tocando: servicio,
 * día y hora; solo se escribe el nombre. Las horas salen del motor de huecos,
 * así que nunca ofrece una que ya esté ocupada.
 *
 * "Repetir cada semana" aparta la misma hora varias semanas seguidas (los
 * fijos de la oferta semanal). Las semanas que ya están ocupadas o cerradas
 * se saltan y se avisa de cuáles fueron.
 *
 * Props: fechaInicial (Date), horaInicial ("HH:MM", opcional: viene de pulsar
 * un hueco libre), onClose, onCreada(texto del aviso).
 */
const NewAppointmentDialogComponent = ({ fechaInicial, horaInicial, onClose, onCreada }) => {
  // #region Declaraciones, variables y hooks
  const [servicios, setServicios] = useState([])
  const [servicioId, setServicioId] = useState('')
  const [fechaStr, setFechaStr] = useState(toInputDate(fechaInicial || new Date()))
  const [rejilla, setRejilla] = useState(null)
  const [horaISO, setHoraISO] = useState('')
  const [nombre, setNombre] = useState('')
  const [movil, setMovil] = useState('')
  const [repetir, setRepetir] = useState(false)
  const [semanas, setSemanas] = useState(4)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [horario, setHorario] = useState(null)

  const servicio = servicios.find((s) => String(s.id) === String(servicioId))

  // Carga horario y servicios una vez (para citas manuales se ofrecen los activos).
  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const [h, ss] = await Promise.all([ConfigurationService.getHorario(), ConfigurationService.getServicios()])
      if (!vivo) return
      const activos = ss.filter((s) => s.activo !== false)
      setHorario(h)
      setServicios(activos)
      setServicioId(activos[0]?.id ?? '')
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  // Recalcula huecos libres cuando cambia servicio, fecha u horario.
  useEffect(() => {
    const svc = servicios.find((s) => String(s.id) === String(servicioId))
    if (!svc || !horario) return
    let vivo = true
    const cargar = async () => {
      const libres = await huecosDelDia({ fecha: new Date(`${fechaStr}T00:00:00`), duracion: svc.duracion, horario })
      if (!vivo) return
      setRejilla(libres)
      // Si se vino desde un hueco libre, esa hora sale ya marcada.
      const preferida = horaInicial && libres.find((s) => fmtHora(s.inicio) === horaInicial)
      setHoraISO(preferida ? preferida.inicio.toISOString() : '')
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [servicioId, fechaStr, horario, servicios, horaInicial])

  const cambiarFecha = (v) => {
    setRejilla(null)
    setFechaStr(v)
  }

  const fechas = horaISO ? semanasDesde(new Date(horaISO), repetir ? semanas : 1) : []

  const onGuardar = async (e) => {
    e?.preventDefault()
    if (guardando) return
    if (!servicio) return setError('Elige un servicio.')
    if (!horaISO) return setError('Elige una hora.')
    if (nombre.trim().length < 2) return setError('Escribe el nombre del cliente.')
    setGuardando(true)
    setError('')

    // Días libres que pisan alguna de las semanas: esas se saltan.
    const ultima = fechas.at(-1)
    const bloqueos = fechas.length > 1 ? await AgendaService.listarBloqueos(fechas[0], addMinutes(ultima, servicio.duracion)) : []

    const guardadas = []
    const saltadas = []
    for (const [i, inicio] of fechas.entries()) {
      const fin = addMinutes(inicio, servicio.duracion)
      const cerrado = i > 0 && bloqueos.some((b) => new Date(b.inicio) < fin && new Date(b.fin) > inicio)
      if (cerrado) {
        saltadas.push(inicio)
        continue
      }
      const res = await AgendaService.crearCitaManual({
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        clienteNombre: nombre.trim(),
        clienteMovil: movil.replace(/\s+/g, ''),
        inicio,
        fin,
      })
      if (res.ok) guardadas.push(inicio)
      else if (i === 0) {
        // La primera es la que ha elegido a mano: si falla, no se sigue.
        setGuardando(false)
        return setError(res.error)
      } else saltadas.push(inicio)
    }
    setGuardando(false)

    const quien = nombre.trim().split(' ')[0]
    const primera = new Date(horaISO)
    let texto = `Cita de ${quien} a las ${fmtHora(primera)} guardada`
    if (fechas.length > 1) {
      texto = `${quien}: ${guardadas.length} ${DIAS_SEMANA[primera.getDay()]} a las ${fmtHora(primera)} guardados`
      if (saltadas.length) texto += `. Ocupado: ${saltadas.map(diaYMes).join(', ')}`
    }
    onCreada(texto)
    onClose()
  }
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent
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
          <PrimaryButtonComponent type="button" onClick={onGuardar} cargando={guardando} className="w-full">
            {!horaISO
              ? 'Guardar cita'
              : fechas.length > 1
                ? `Guardar ${fechas.length} citas a las ${fmtHora(new Date(horaISO))}`
                : `Guardar cita a las ${fmtHora(new Date(horaISO))}`}
          </PrimaryButtonComponent>
        </div>
      }
    >
      <form onSubmit={onGuardar} className="space-y-6">
        <FieldComponent label="Servicio">
          <div className="grid gap-2 sm:grid-cols-2">
            {servicios.map((s) => {
              const Icono = ICONS[s.icono] || ICONS.Scissors
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
        </FieldComponent>

        <FieldComponent label="Día">
          <DateShortcutsComponent valor={fechaStr} onCambio={cambiarFecha} />
        </FieldComponent>

        <FieldComponent label="Hora">
          <TimePickerComponent rejilla={rejilla} valor={horaISO} onCambio={setHoraISO} />
        </FieldComponent>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldComponent label="Nombre">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="off"
              className={INPUT_CLASS_NAME}
              placeholder="Nombre del cliente"
            />
          </FieldComponent>
          <FieldComponent label="Móvil (opcional)">
            <input
              value={movil}
              onChange={(e) => setMovil(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="off"
              className={INPUT_CLASS_NAME}
              placeholder="600 000 000"
            />
          </FieldComponent>
        </div>

        {/* Fijos semanales. */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-hueso-200">
          <div className="flex items-center gap-3">
            <Repeat size={18} className="shrink-0 text-acento-oscuro" />
            <p className="min-w-0 flex-1 text-sm leading-snug">
              <span className="font-semibold">Repetir cada semana</span>
              <span className="block text-xs text-tinta/50">Para los fijos: misma hora, varias semanas.</span>
            </p>
            <SwitchComponent activo={repetir} onCambio={setRepetir} etiqueta="Repetir cada semana" />
          </div>

          {repetir && (
            <div className="mt-4 space-y-3">
              <div className="max-w-[14rem]">
                <StepperComponent
                  valor={semanas}
                  onCambio={(v) => setSemanas(Math.min(SEMANAS_MAX, Math.max(SEMANAS_MIN, v)))}
                  min={SEMANAS_MIN}
                  sufijo="semanas"
                  etiqueta="semanas"
                />
              </div>
              {fechas.length > 1 ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="Días que se apartan">
                  {fechas.map((d) => (
                    <li key={d.toISOString()} className="rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-hueso-200">
                      {formatShortDate(d).diaSemana} {diaYMes(d)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-tinta/50">Elige primero la hora.</p>
              )}
            </div>
          )}
        </div>
      </form>
    </SheetComponent>
  )
  // #endregion
}

export default NewAppointmentDialogComponent
