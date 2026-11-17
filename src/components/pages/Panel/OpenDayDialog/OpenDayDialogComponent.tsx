// #region Imports
import { useState } from 'react'
import type { FunctionComponent, SyntheticEvent } from 'react'
import SheetComponent from '../Sheet/SheetComponent'
import FieldComponent from '../Controls/Field/FieldComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import { INPUT_CLASS_NAME } from '../Controls/controlClasses'
import { atTime } from '../../../../utils/availability'
import { formatLongDate, toInputDate } from '../../../../utils/dates'
import { ConfigurationService } from '../../../../services/ConfigurationService'
import type { IOpenDayDialogProps } from './IOpenDayDialogProps'
// #endregion

// #region Constantes
// Horas que salen propuestas al abrir un día.
const DESDE_INICIAL = '09:00'
const HASTA_INICIAL = '14:00'

// Lo que se añade a la fecha del campo (AAAA-MM-DD) para leerla en hora local.
const SUFIJO_MEDIANOCHE = 'T00:00:00'
// #endregion

/**
 * Abrir un día (o unas horas) que normalmente se cierra: "el sábado 20 abro
 * por la mañana". Ese rato pasa a contar como horario de trabajo solo ese
 * día: se pueden apuntar citas en el panel y la web lo ofrece para reservar
 * (si cae dentro de los días que se pueden reservar online).
 */
const OpenDayDialogComponent: FunctionComponent<IOpenDayDialogProps> = ({ fechaInicial, onClose, onAbierto }) => {
  // #region Declaraciones, variables y hooks
  const [fechaStr, setFechaStr] = useState<string>(toInputDate(fechaInicial))
  const [desde, setDesde] = useState<string>(DESDE_INICIAL)
  const [hasta, setHasta] = useState<string>(HASTA_INICIAL)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const onGuardar = async (e?: SyntheticEvent) => {
    e?.preventDefault()
    if (guardando) return
    const fecha = new Date(`${fechaStr}${SUFIJO_MEDIANOCHE}`)
    const inicio = atTime(fecha, desde)
    const fin = atTime(fecha, hasta)
    if (!desde || !hasta || fin <= inicio) {
      setError('La hora de cierre tiene que ser después de la de apertura.')
      return
    }
    setGuardando(true)
    setError('')
    const res = await ConfigurationService.crearApertura(inicio, fin)
    setGuardando(false)
    if (!res.ok) {
      setError(res.error ?? '')
      return
    }
    onAbierto(`${formatLongDate(fecha)}: abierto de ${desde} a ${hasta}`)
    onClose()
  }
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent
      title="Abrir un día"
      subtitle="Para trabajar un día que normalmente cierras (o unas horas más). Solo cuenta para ese día."
      onClose={onClose}
      footer={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <PrimaryButtonComponent type="button" onClick={onGuardar} loading={guardando} className="w-full">
            Abrir de {desde} a {hasta}
          </PrimaryButtonComponent>
        </div>
      }
    >
      <form onSubmit={onGuardar} className="space-y-6">
        <FieldComponent label="Día">
          <DateShortcutsComponent value={fechaStr} onChange={setFechaStr} />
        </FieldComponent>

        <FieldComponent label="Horas" help="Puedes abrir otro rato el mismo día si vas a hacer descanso.">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs text-tinta/50">Abro a las</span>
              <input type="time" value={desde} onChange={(e) => setDesde(e.target.value)} className={INPUT_CLASS_NAME} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-tinta/50">Cierro a las</span>
              <input type="time" value={hasta} onChange={(e) => setHasta(e.target.value)} className={INPUT_CLASS_NAME} />
            </label>
          </div>
        </FieldComponent>

        <p className="rounded-2xl bg-acento/10 px-4 py-3 text-sm text-tinta/70">
          Esas horas salen libres en tu agenda para apuntar citas. En la web también se podrán reservar cuando ese día
          entre en los días que se reservan online.
        </p>
      </form>
    </SheetComponent>
  )
  // #endregion
}

export default OpenDayDialogComponent
