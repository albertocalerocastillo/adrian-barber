// #region Imports
import { useState, useEffect } from 'react'
import { m } from 'motion/react'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import SheetComponent from '../Sheet/SheetComponent'
import TimePickerComponent from '../TimePicker/TimePickerComponent'
import { huecosDelDia, buildWhatsappLink } from '../agendaSlots'
import FieldComponent from '../Controls/Field/FieldComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import WhatsAppIconComponent from '../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { addMinutes } from '../../../../utils/availability'
import { formatTime as fmtHora, formatLongDate, toInputDate } from '../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { AgendaService } from '../../../../services/AgendaService'
import { ConfigurationService } from '../../../../services/ConfigurationService'
// #endregion

/**
 * Cambiar una cita de día u hora ("¿me lo pasas al jueves?"). Se elige el día
 * y salen solo las horas libres (contando como libre el hueco de la propia
 * cita). Al guardar, ofrece mandarle al cliente un WhatsApp ya escrito.
 *
 * Props: cita, onClose, onMovida(cita, inicioAnterior, finAnterior).
 */
const RescheduleDialogComponent = ({ cita, onClose, onMovida }) => {
  // #region Declaraciones, variables y hooks
  const inicioOriginal = new Date(cita.inicio)
  const duracion = Math.round((new Date(cita.fin) - inicioOriginal) / 60000)
  const [horario, setHorario] = useState(null)
  const [fechaStr, setFechaStr] = useState(toInputDate(inicioOriginal))
  const [rejilla, setRejilla] = useState(null)
  const [horaISO, setHoraISO] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  // Nueva hora, cuando ya se ha guardado.
  const [hecha, setHecha] = useState(null)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const h = await ConfigurationService.getHorario()
      if (vivo) setHorario(h)
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (!horario) return
    let vivo = true
    const cargar = async () => {
      const libres = await huecosDelDia({ fecha: new Date(`${fechaStr}T00:00:00`), duracion, horario, excluirId: cita.id })
      if (!vivo) return
      // La hora que ya tiene no se ofrece: no sería un cambio.
      setRejilla(libres.filter((s) => s.inicio.getTime() !== inicioOriginal.getTime()))
      setHoraISO('')
    }
    cargar()
    return () => {
      vivo = false
    }
    // El inicioOriginal sale de la cita, que no cambia mientras la hoja está abierta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaStr, horario, duracion, cita.id])

  const nombre = cita.clienteNombre.split(' ')[0]

  const onGuardar = async () => {
    if (guardando) return
    if (!horaISO) return setError('Elige la hora nueva.')
    setGuardando(true)
    setError('')
    const inicio = new Date(horaISO)
    const res = await AgendaService.moverCita(cita.id, inicio, addMinutes(inicio, duracion))
    setGuardando(false)
    if (!res.ok) return setError(res.error)
    onMovida(cita, new Date(cita.inicio), new Date(cita.fin))
    setHecha(inicio)
  }

  if (hecha) {
    const mensaje = `Hola ${nombre}, te he cambiado la cita al ${formatLongDate(hecha).toLowerCase()} a las ${fmtHora(hecha)}. ¡Nos vemos! Adrián`
    const whatsapp = buildWhatsappLink(cita.clienteMovil, mensaje)
    return (
      <SheetComponent titulo="Cita cambiada" onCerrar={onClose}>
        <m.div
          className="flex flex-col items-center py-4 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CalendarCheck size={30} />
          </span>
          <p className="mt-4 font-display text-2xl font-bold">{cita.clienteNombre}</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-tinta/45 line-through">
              {formatLongDate(inicioOriginal)} · {fmtHora(inicioOriginal)}
            </span>
            <ArrowRight size={14} className="text-tinta/35" />
            <span className="font-semibold">
              {formatLongDate(hecha)} · {fmtHora(hecha)}
            </span>
          </p>

          {whatsapp ? (
            <>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <WhatsAppIconComponent size={20} /> Avisar a {nombre} por WhatsApp
              </a>
              <p className="mt-3 max-w-xs text-xs text-tinta/45">Se abre WhatsApp con el mensaje ya escrito; solo tienes que darle a enviar.</p>
            </>
          ) : (
            <p className="mt-6 text-sm text-tinta/50">Esta cita no tiene móvil: avísale tú.</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
          >
            Listo
          </button>
        </m.div>
      </SheetComponent>
    )
  }
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent
      titulo="Cambiar hora"
      subtitulo={`${cita.clienteNombre} · ${cita.servicioNombre}`}
      onCerrar={onClose}
      pie={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <PrimaryButtonComponent type="button" onClick={onGuardar} cargando={guardando} className="w-full">
            {horaISO ? `Pasar a las ${fmtHora(new Date(horaISO))}` : 'Elige la hora nueva'}
          </PrimaryButtonComponent>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="rounded-2xl bg-hueso/70 px-4 py-3 text-sm">
          <span className="text-tinta/50">Ahora: </span>
          <span className="font-semibold">
            {formatLongDate(inicioOriginal)} a las {fmtHora(inicioOriginal)}
          </span>
        </p>
        <FieldComponent etiqueta="Nuevo día">
          <DateShortcutsComponent
            valor={fechaStr}
            onCambio={(v) => {
              setRejilla(null)
              setFechaStr(v)
            }}
          />
        </FieldComponent>
        <FieldComponent etiqueta="Nueva hora">
          <TimePickerComponent rejilla={rejilla} valor={horaISO} onCambio={setHoraISO} />
        </FieldComponent>
      </div>
    </SheetComponent>
  )
  // #endregion
}

export default RescheduleDialogComponent
