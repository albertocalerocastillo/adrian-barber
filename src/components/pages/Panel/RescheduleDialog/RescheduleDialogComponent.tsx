// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import SheetComponent from '../Sheet/SheetComponent'
import TimePickerComponent from '../TimePicker/TimePickerComponent'
import RescheduleDoneComponent from './RescheduleDone/RescheduleDoneComponent'
import { huecosDelDia } from '../agendaSlots'
import FieldComponent from '../Controls/Field/FieldComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import { addMinutes } from '../../../../utils/availability'
import { formatTime as fmtHora, formatLongDate, toInputDate } from '../../../../utils/dates'
import { AgendaService } from '../../../../services/AgendaService'
import { ConfigurationService } from '../../../../services/ConfigurationService'
import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
import type { HuecoDTO } from '../../../../services/dtos/HuecoDTO'
import type { IRescheduleDialogProps } from './IRescheduleDialogProps'
// #endregion

// #region Constantes
// Milisegundos de un minuto.
const MS_MINUTO = 60000

// Lo que se añade a la fecha del campo (AAAA-MM-DD) para leerla en hora local.
const SUFIJO_MEDIANOCHE = 'T00:00:00'
// #endregion

/**
 * Cambiar una cita de día u hora ("¿me lo pasas al jueves?"). Se elige el día
 * y salen solo las horas libres (contando como libre el hueco de la propia
 * cita). Al guardar, ofrece mandarle al cliente un WhatsApp ya escrito.
 */
const RescheduleDialogComponent: FunctionComponent<IRescheduleDialogProps> = ({ cita, onClose, onMovida }) => {
  // #region Declaraciones, variables y hooks
  const inicioOriginal = new Date(cita.inicio)
  const duracion = Math.round((new Date(cita.fin).getTime() - inicioOriginal.getTime()) / MS_MINUTO)
  const [horario, setHorario] = useState<HorarioDiaDTO[] | null>(null)
  const [fechaStr, setFechaStr] = useState<string>(toInputDate(inicioOriginal))
  const [rejilla, setRejilla] = useState<HuecoDTO[] | null>(null)
  const [horaISO, setHoraISO] = useState<string>('')
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  // Nueva hora, cuando ya se ha guardado.
  const [hecha, setHecha] = useState<Date | null>(null)

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
      const libres = await huecosDelDia({ fecha: new Date(`${fechaStr}${SUFIJO_MEDIANOCHE}`), duracion, horario, excluirId: cita.id })
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

  const onGuardar = async () => {
    if (guardando) return
    if (!horaISO) {
      setError('Elige la hora nueva.')
      return
    }
    setGuardando(true)
    setError('')
    const inicio = new Date(horaISO)
    const res = await AgendaService.moverCita(cita.id, inicio, addMinutes(inicio, duracion))
    setGuardando(false)
    if (!res.ok) {
      setError(res.error ?? '')
      return
    }
    onMovida(cita, new Date(cita.inicio), new Date(cita.fin))
    setHecha(inicio)
  }

  const cambiarFecha = (v: string) => {
    setRejilla(null)
    setFechaStr(v)
  }
  // #endregion

  // #region Renderizado
  // Una vez guardada, la misma hoja pasa a enseñar el cambio y el WhatsApp.
  if (hecha) {
    return (
      <SheetComponent title="Cita cambiada" onClose={onClose}>
        <RescheduleDoneComponent cita={cita} inicioOriginal={inicioOriginal} inicioNuevo={hecha} onClose={onClose} />
      </SheetComponent>
    )
  }

  return (
    <SheetComponent
      title="Cambiar hora"
      subtitle={`${cita.clienteNombre} · ${cita.servicioNombre}`}
      onClose={onClose}
      footer={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <PrimaryButtonComponent type="button" onClick={onGuardar} loading={guardando} className="w-full">
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
        <FieldComponent label="Nuevo día">
          <DateShortcutsComponent value={fechaStr} onChange={cambiarFecha} />
        </FieldComponent>
        <FieldComponent label="Nueva hora">
          <TimePickerComponent slots={rejilla} value={horaISO} onChange={setHoraISO} />
        </FieldComponent>
      </div>
    </SheetComponent>
  )
  // #endregion
}

export default RescheduleDialogComponent
