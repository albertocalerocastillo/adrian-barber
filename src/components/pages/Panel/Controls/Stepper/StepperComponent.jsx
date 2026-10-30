// #region Imports
import { Minus, Plus } from 'lucide-react'
// #endregion

/** Número con botones − / + (duración, precio). Grande para el dedo. */
const StepperComponent = ({ valor, onCambio, paso = 1, min = 0, sufijo, etiqueta }) => {
  const fijar = (v) => onCambio(Math.max(min, Math.round(v * 100) / 100))
  return (
    <div className="flex items-center rounded-xl border border-hueso-200 bg-white">
      <button
        type="button"
        onClick={() => fijar(valor - paso)}
        aria-label={`Menos ${etiqueta}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Minus size={16} />
      </button>
      <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
        <span className="sr-only">{etiqueta}</span>
        <input
          type="number"
          inputMode="decimal"
          value={valor}
          min={min}
          step={paso}
          onChange={(e) => fijar(Number(e.target.value))}
          className="w-12 min-w-0 bg-transparent text-center font-display text-lg font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {sufijo && <span className="text-sm text-tinta/45">{sufijo}</span>}
      </label>
      <button
        type="button"
        onClick={() => fijar(valor + paso)}
        aria-label={`Más ${etiqueta}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

export default StepperComponent
