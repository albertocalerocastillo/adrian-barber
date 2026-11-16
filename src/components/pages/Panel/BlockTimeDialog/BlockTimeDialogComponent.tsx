// #region Imports
import { useState, useEffect } from 'react'
import type { FunctionComponent, SyntheticEvent } from 'react'
import SheetComponent from '../Sheet/SheetComponent'
import FieldComponent from '../Controls/Field/FieldComponent'
import SegmentedControlComponent from '../Controls/SegmentedControl/SegmentedControlComponent'
import PrimaryButtonComponent from '../Controls/PrimaryButton/PrimaryButtonComponent'
import DateShortcutsComponent from '../Controls/DateShortcuts/DateShortcutsComponent'
import { INPUT_CLASS_NAME } from '../Controls/controlClasses'
import { atTime, addMinutes, MINUTES_PER_DAY } from '../../../../utils/availability'
import { startOfDay, formatLongDate, toInputDate } from '../../../../utils/dates'
import { AgendaService } from '../../../../services/AgendaService'
import { EstadoCitaEnum } from '../../../../services/enums/EstadoCitaEnum'
import type { CitaDTO } from '../../../../services/dtos/CitaDTO'
import AffectedAppointmentsComponent from './AffectedAppointments/AffectedAppointmentsComponent'
import type { IBlockTimeDialogProps } from './IBlockTimeDialogProps'
// #endregion

// #region Constantes
// Motivos que se eligen con un toque.
const MOTIVOS = ['Vacaciones', 'Médico', 'Descanso', 'Formación']

// Rato que sale propuesto al elegir "Unas horas".
const DESDE_INICIAL = '10:00'
const HASTA_INICIAL = '14:00'

// Lo que se añade a la fecha del campo (AAAA-MM-DD) para leerla en hora local.
const SUFIJO_MEDIANOCHE = 'T00:00:00'
// #endregion

/** "1 cita" o "3 citas". */
const contarCitas = (n: number): string => (n === 1 ? '1 cita' : `${n} citas`)

/**
 * Cierra un día entero o un rato (vacaciones, médico, descanso). Esos huecos
 * desaparecen de la web automáticamente.
 *
 * Si en ese rato ya hay citas, lo dice antes de cerrar; al cerrar las cancela
 * (nadie va a estar para atenderlas) y deja un WhatsApp escrito para avisar a
 * cada cliente.
 */
const BlockTimeDialogComponent: FunctionComponent<IBlockTimeDialogProps> = ({ fechaInicial, onClose, onCreado }) => {
  // #region Declaraciones, variables y hooks
  const [fechaStr, setFechaStr] = useState<string>(toInputDate(fechaInicial || new Date()))
  const [todoElDia, setTodoElDia] = useState<boolean>(true)
  const [desde, setDesde] = useState<string>(DESDE_INICIAL)
  const [hasta, setHasta] = useState<string>(HASTA_INICIAL)
  const [motivo, setMotivo] = useState<string>('')
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  // Citas activas que caen en el rato elegido (null mientras se miran).
  const [afectadas, setAfectadas] = useState<CitaDTO[] | null>(null)
  // Texto del aviso final, cuando ya se ha cerrado y quedan clientes por avisar.
  const [hecho, setHecho] = useState<string>('')

  const fecha = new Date(`${fechaStr}${SUFIJO_MEDIANOCHE}`)
  const inicio = todoElDia ? startOfDay(fecha) : atTime(fecha, desde)
  const fin = todoElDia ? addMinutes(inicio, MINUTES_PER_DAY) : atTime(fecha, hasta)
  const desdeMs = inicio.getTime()
  const hastaMs = fin.getTime()

  // Mira qué citas hay en ese rato cada vez que cambia el día o las horas.
  useEffect(() => {
    if (hecho) return
    let vivo = true
    const mirar = async () => {
      setAfectadas(null)
      const delDia = startOfDay(new Date(desdeMs))
      const citas = await AgendaService.listarCitas(delDia, addMinutes(delDia, MINUTES_PER_DAY)).catch(() => null)
      if (!vivo) return
      // Sin saber qué citas hay no se deja cerrar: se podría dejar a alguien sin avisar.
      if (!citas) {
        setError('No se pudieron comprobar las citas de ese día. Revisa la conexión y vuelve a elegir el día.')
        return
      }
      setError('')
      // Solo las pendientes que aún no han pasado: las atendidas ya se hicieron y no se tocan.
      const ahoraMs = Date.now()
      setAfectadas(
        citas.filter((c) => {
          const ini = new Date(c.inicio).getTime()
          const fin = new Date(c.fin).getTime()
          return c.estado === EstadoCitaEnum.Pendiente && fin > ahoraMs && ini < hastaMs && fin > desdeMs
        })
      )
    }
    mirar()
    return () => {
      vivo = false
    }
  }, [desdeMs, hastaMs, hecho])

  const onGuardar = async (e?: SyntheticEvent) => {
    e?.preventDefault()
    if (guardando || afectadas === null) return
    if (!todoElDia && fin <= inicio) {
      setError('La hora de fin tiene que ser después de la de inicio.')
      return
    }
    setGuardando(true)
    setError('')
    const res = await AgendaService.crearBloqueo({ inicio, fin, motivo: motivo.trim() })
    if (!res.ok) {
      setGuardando(false)
      setError(res.error ?? '')
      return
    }
    const cancelaciones = await Promise.all(afectadas.map((c) => AgendaService.cambiarEstado(c.id, EstadoCitaEnum.Cancelada)))
    setGuardando(false)
    const fallidas = cancelaciones.filter((r) => !r.ok).length
    const texto =
      `${formatLongDate(fecha)}: ${todoElDia ? 'cerrado todo el día' : `cerrado de ${desde} a ${hasta}`}` +
      (afectadas.length > 0 ? ` · ${contarCitas(afectadas.length - fallidas)} cancelada${afectadas.length - fallidas === 1 ? '' : 's'}` : '')
    if (fallidas > 0) {
      // El día ya está cerrado: se avisa de las que no se pudieron cancelar para hacerlo a mano.
      setError(`No se pudieron cancelar ${contarCitas(fallidas)}. Cancélalas desde la agenda.`)
    }
    if (afectadas.length === 0) {
      onCreado(texto)
      onClose()
      return
    }
    // Quedan clientes por avisar: la hoja sigue abierta con sus WhatsApp.
    setHecho(texto)
  }

  const terminar = () => {
    onCreado(hecho)
    onClose()
  }

  if (hecho && afectadas) {
    return (
      <SheetComponent
        title="Día cerrado"
        subtitle="Avisa a cada cliente para que no venga: el mensaje ya va escrito."
        onClose={terminar}
        footer={
          <div>
            {error && (
              <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
            <PrimaryButtonComponent type="button" onClick={terminar} className="w-full">
              Listo
            </PrimaryButtonComponent>
          </div>
        }
      >
        <p className="mb-4 text-sm text-tinta/60">{hecho}</p>
        <AffectedAppointmentsComponent citas={afectadas} conAviso />
      </SheetComponent>
    )
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
          <PrimaryButtonComponent type="button" onClick={onGuardar} loading={guardando || (afectadas === null && !error)}
            disabled={afectadas === null}
            className="w-full"
          >
            Cerrar {todoElDia ? 'el día' : `de ${desde} a ${hasta}`}
            {afectadas && afectadas.length > 0 && ` y cancelar ${contarCitas(afectadas.length)}`}
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
            onChange={(valor) => setTodoElDia(valor === true)}
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

        {afectadas && afectadas.length > 0 && (
          <div role="alert" className="rounded-2xl bg-red-50 p-4">
            <p className="mb-3 text-sm text-red-800">
              Ese {todoElDia ? 'día' : 'rato'} tienes <strong>{contarCitas(afectadas.length)}</strong>. Al cerrarlo se
              cancelan y te dejo el WhatsApp escrito para avisar a cada cliente.
            </p>
            <AffectedAppointmentsComponent citas={afectadas} />
          </div>
        )}

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
