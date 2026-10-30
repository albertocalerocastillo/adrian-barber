// #region Imports
import { useState } from 'react'
import SheetComponent from '../Sheet/SheetComponent'
import FieldComponent from '../Controls/Field/FieldComponent'
import SegmentedControlComponent from '../Controls/SegmentedControl/SegmentedControlComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import { INPUT_CLASS_NAME } from '../Controls/controlClasses'
import { atTime, addMinutes, MINUTES_PER_DAY } from '../../../../utils/availability'
import { startOfDay, formatLongDate, toInputDate } from '../../../../utils/dates'
import { AgendaService } from '../../../../services/AgendaService'
// #endregion

const MOTIVOS = ['Vacaciones', 'Médico', 'Descanso', 'Formación']

/**
 * Cierra un día entero o un rato (vacaciones, médico, descanso). Esos huecos
 * desaparecen de la web automáticamente.
 */
const BlockTimeDialogComponent = ({ fechaInicial, onClose, onCreado }) => {
  // #region Declaraciones, variables y hooks
  const [fechaStr, setFechaStr] = useState(toInputDate(fechaInicial || new Date()))
  const [todoElDia, setTodoElDia] = useState(true)
  const [desde, setDesde] = useState('10:00')
  const [hasta, setHasta] = useState('14:00')
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const onGuardar = async (e) => {
    e?.preventDefault()
    if (guardando) return
    const fecha = new Date(`${fechaStr}T00:00:00`)
    let ini, fin
    if (todoElDia) {
      ini = startOfDay(fecha)
      fin = addMinutes(ini, MINUTES_PER_DAY)
    } else {
      ini = atTime(fecha, desde)
      fin = atTime(fecha, hasta)
      if (fin <= ini) {
        setError('La hora de fin tiene que ser después de la de inicio.')
        return
      }
    }
    setGuardando(true)
    setError('')
    const res = await AgendaService.crearBloqueo({ inicio: ini, fin, motivo: motivo.trim() })
    setGuardando(false)
    if (res.ok) {
      onCreado(`${formatLongDate(fecha)}: ${todoElDia ? 'cerrado todo el día' : `cerrado de ${desde} a ${hasta}`}`)
      onClose()
    } else {
      setError(res.error)
    }
  }
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent
      title="Día libre"
      subtitle="Cierra un día o un rato. Esos huecos desaparecen de la web."
      onClose={onClose}
      footer={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <PrimaryButtonComponent type="button" onClick={onGuardar} loading={guardando} className="w-full">
            Cerrar {todoElDia ? 'el día' : `de ${desde} a ${hasta}`}
          </PrimaryButtonComponent>
        </div>
      }
    >
      <form onSubmit={onGuardar} className="space-y-6">
        <FieldComponent label="Día">
          <DateShortcutsComponent value={fechaStr} onChange={setFechaStr} />
        </FieldComponent>

        <FieldComponent label="¿Cuánto?">
          <SegmentedControlComponent
            options={[
              { value: true, text: 'Todo el día' },
              { value: false, text: 'Unas horas' },
            ]}
            value={todoElDia}
            onChange={setTodoElDia}
          />
          {!todoElDia && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-tinta/50">Desde</span>
                <input type="time" value={desde} onChange={(e) => setDesde(e.target.value)} className={INPUT_CLASS_NAME} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-tinta/50">Hasta</span>
                <input type="time" value={hasta} onChange={(e) => setHasta(e.target.value)} className={INPUT_CLASS_NAME} />
              </label>
            </div>
          )}
        </FieldComponent>

        <FieldComponent label="Motivo (opcional)" help="Solo lo ves tú.">
          <div className="mb-2 flex flex-wrap gap-2">
            {MOTIVOS.map((mo) => (
              <button
                key={mo}
                type="button"
                onClick={() => setMotivo(mo)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${
                  motivo === mo ? 'bg-tinta text-hueso' : 'bg-white text-tinta/65 ring-1 ring-hueso-200 hover:ring-tinta/30'
                }`}
              >
                {mo}
              </button>
            ))}
          </div>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className={INPUT_CLASS_NAME}
            placeholder="U otro motivo…"
          />
        </FieldComponent>
      </form>
    </SheetComponent>
  )
  // #endregion
}

export default BlockTimeDialogComponent
