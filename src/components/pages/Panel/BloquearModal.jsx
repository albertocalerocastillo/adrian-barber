// #region Imports
import { useState } from 'react'
import Hoja from './Hoja'
import { Campo, Segmentado, BotonPrincipal, AtajosFecha, claseInput } from './Controles'
import { aHora, sumarMin, MINUTOS_DIA } from '../../../utils/disponibilidad'
import { inicioDia, fechaLarga, aInputDate } from '../../../utils/fechas'
import { crearBloqueo } from '../../../lib/panel'
// #endregion

const MOTIVOS = ['Vacaciones', 'Médico', 'Descanso', 'Formación']

/**
 * Cierra un día entero o un rato (vacaciones, médico, descanso). Esos huecos
 * desaparecen de la web automáticamente.
 */
const BloquearModal = ({ fechaInicial, onClose, onCreado }) => {
  // #region Declaraciones, variables y hooks
  const [fechaStr, setFechaStr] = useState(aInputDate(fechaInicial || new Date()))
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
      ini = inicioDia(fecha)
      fin = sumarMin(ini, MINUTOS_DIA)
    } else {
      ini = aHora(fecha, desde)
      fin = aHora(fecha, hasta)
      if (fin <= ini) {
        setError('La hora de fin tiene que ser después de la de inicio.')
        return
      }
    }
    setGuardando(true)
    setError('')
    const res = await crearBloqueo({ inicio: ini, fin, motivo: motivo.trim() })
    setGuardando(false)
    if (res.ok) {
      onCreado(`${fechaLarga(fecha)}: ${todoElDia ? 'cerrado todo el día' : `cerrado de ${desde} a ${hasta}`}`)
      onClose()
    } else {
      setError(res.error)
    }
  }
  // #endregion

  // #region Renderizado
  return (
    <Hoja
      titulo="Día libre"
      subtitulo="Cierra un día o un rato. Esos huecos desaparecen de la web."
      onCerrar={onClose}
      pie={
        <div>
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <BotonPrincipal type="button" onClick={onGuardar} cargando={guardando} className="w-full">
            Cerrar {todoElDia ? 'el día' : `de ${desde} a ${hasta}`}
          </BotonPrincipal>
        </div>
      }
    >
      <form onSubmit={onGuardar} className="space-y-6">
        <Campo etiqueta="Día">
          <AtajosFecha valor={fechaStr} onCambio={setFechaStr} />
        </Campo>

        <Campo etiqueta="¿Cuánto?">
          <Segmentado
            opciones={[
              { valor: true, texto: 'Todo el día' },
              { valor: false, texto: 'Unas horas' },
            ]}
            valor={todoElDia}
            onCambio={setTodoElDia}
          />
          {!todoElDia && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-tinta/50">Desde</span>
                <input type="time" value={desde} onChange={(e) => setDesde(e.target.value)} className={claseInput} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-tinta/50">Hasta</span>
                <input type="time" value={hasta} onChange={(e) => setHasta(e.target.value)} className={claseInput} />
              </label>
            </div>
          )}
        </Campo>

        <Campo etiqueta="Motivo (opcional)" ayuda="Solo lo ves tú.">
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
            className={claseInput}
            placeholder="U otro motivo…"
          />
        </Campo>
      </form>
    </Hoja>
  )
  // #endregion
}

export default BloquearModal
