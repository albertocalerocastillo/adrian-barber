// #region Imports
import type { FunctionComponent } from 'react'
import type { ISwitchProps } from './ISwitchProps'
// #endregion

/** Interruptor sí/no (más claro con el dedo que una casilla). */
const SwitchComponent: FunctionComponent<ISwitchProps> = ({ active, onChange, label }) => {
  // #region Renderizado
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={() => onChange(!active)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
        active ? 'bg-acento' : 'bg-tinta/15'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-suave)] ${
          active ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
  // #endregion
}

export default SwitchComponent
