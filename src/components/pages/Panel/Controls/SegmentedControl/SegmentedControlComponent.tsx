// #region Imports
import type { FunctionComponent } from 'react'
import type { ISegmentedControlProps } from './ISegmentedControlProps'
// #endregion

/** Fila de opciones donde se elige una (Día / Semana, Todo el día / Unas horas). */
const SegmentedControlComponent: FunctionComponent<ISegmentedControlProps> = ({ options, value, onChange, dark = false }) => {
  // #region Renderizado
  return (
    <div className={`inline-flex rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-tinta/5'}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              selected
                ? 'bg-tinta text-hueso shadow-md'
                : dark
                  ? 'text-hueso/60 hover:text-hueso'
                  : 'text-tinta/55 hover:text-tinta'
            }`}
          >
            {option.text}
          </button>
        )
      })}
    </div>
  )
  // #endregion
}

export default SegmentedControlComponent
