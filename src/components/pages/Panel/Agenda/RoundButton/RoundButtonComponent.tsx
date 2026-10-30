// #region Imports
import type { FunctionComponent } from 'react'
import type { IRoundButtonProps } from './IRoundButtonProps'
// #endregion

/** Botón redondo de solo icono (flechas de la agenda). */
const RoundButtonComponent: FunctionComponent<IRoundButtonProps> = ({ onClick, label, children }) => {
  // #region Renderizado
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-tinta/60 transition-colors hover:bg-tinta/5 hover:text-tinta active:scale-90"
    >
      {children}
    </button>
  )
  // #endregion
}

export default RoundButtonComponent
