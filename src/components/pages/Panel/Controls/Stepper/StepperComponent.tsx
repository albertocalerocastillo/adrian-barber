// #region Imports
import type { FunctionComponent } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { IStepperProps } from './IStepperProps'
// #endregion

// #region Constantes
// Se redondea a dos decimales (céntimos).
const ROUNDING_FACTOR = 100
// #endregion

/** Número con botones − / + (duración, precio). Grande para el dedo. */
const StepperComponent: FunctionComponent<IStepperProps> = ({ value, onChange, step = 1, min = 0, suffix, label }) => {
  // #region Declaraciones, variables y hooks
  const setValue = (newValue: number) => onChange(Math.max(min, Math.round(newValue * ROUNDING_FACTOR) / ROUNDING_FACTOR))
  // #endregion

  // #region Renderizado
  return (
    <div className="flex items-center rounded-xl border border-hueso-200 bg-white">
      <button
        type="button"
        onClick={() => setValue(value - step)}
        aria-label={`Menos ${label}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Minus size={16} />
      </button>
      <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
        <span className="sr-only">{label}</span>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          step={step}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-12 min-w-0 bg-transparent text-center font-display text-lg font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-sm text-tinta/45">{suffix}</span>}
      </label>
      <button
        type="button"
        onClick={() => setValue(value + step)}
        aria-label={`Más ${label}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Plus size={16} />
      </button>
    </div>
  )
  // #endregion
}

export default StepperComponent
