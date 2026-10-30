// #region Imports
import type { FunctionComponent } from 'react'
import { Check } from 'lucide-react'
import { PasoReservaEnum } from '../../../../services/enums/PasoReservaEnum'
import type { IStepIndicatorProps } from './IStepIndicatorProps'
// #endregion

// #region Constantes
// Pasos con punto en la barra (la confirmación no lleva).
const PASOS_CON_PUNTO = [
  { paso: PasoReservaEnum.Servicio, nombre: 'Servicio' },
  { paso: PasoReservaEnum.Dia, nombre: 'Día' },
  { paso: PasoReservaEnum.Hora, nombre: 'Hora' },
  { paso: PasoReservaEnum.Datos, nombre: 'Tus datos' },
]
// #endregion

/** Puntos de los pasos. Los ya hechos se pueden pulsar para volver. */
const StepIndicatorComponent: FunctionComponent<IStepIndicatorProps> = ({ paso, onIr }) => {
  // #region Renderizado
  return (
    <ol className="mx-auto mb-6 flex max-w-md items-center">
      {PASOS_CON_PUNTO.map(({ paso: n, nombre }) => {
        const hecho = paso > n
        const activo = paso === n
        return (
          <li key={nombre} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onIr(n)}
              disabled={!hecho}
              aria-current={activo ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  hecho ? 'bg-acento text-tinta' : activo ? 'scale-110 bg-tinta text-hueso shadow-lg' : 'bg-tinta/10 text-tinta/40'
                }`}
              >
                {hecho ? <Check size={16} strokeWidth={3} /> : n}
              </span>
              <span className={`text-[0.7rem] ${activo ? 'font-semibold text-tinta' : 'text-tinta/40'}`}>{nombre}</span>
            </button>
            {n < PASOS_CON_PUNTO.length && (
              <span className="mx-1.5 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/10">
                <span
                  className={`block h-full origin-left bg-acento transition-transform duration-500 ${hecho ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
  // #endregion
}

export default StepIndicatorComponent
