// #region Imports
import type { FunctionComponent } from 'react'
import { Loader2 } from 'lucide-react'
import type { IPrimaryButtonProps } from './IPrimaryButtonProps'
// #endregion

/** Botón principal dorado (guardar, entrar). */
const PrimaryButtonComponent: FunctionComponent<IPrimaryButtonProps> = ({ children, loading, className = '', disabled, ...rest }) => {
  // #region Renderizado
  return (
    <button
      {...rest}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 rounded-full bg-acento px-6 py-3.5 font-semibold text-tinta shadow-lg shadow-acento/25 transition-all duration-300 hover:bg-acento-claro active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
  // #endregion
}

export default PrimaryButtonComponent
