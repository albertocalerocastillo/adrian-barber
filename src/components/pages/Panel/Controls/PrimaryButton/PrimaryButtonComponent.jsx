// #region Imports
import { Loader2 } from 'lucide-react'
// #endregion

/** Botón principal dorado (guardar, entrar). */
const PrimaryButtonComponent = ({ children, cargando, className = '', ...resto }) => {
  return (
    <button
      {...resto}
      disabled={cargando || resto.disabled}
      className={`flex items-center justify-center gap-2 rounded-full bg-acento px-6 py-3.5 font-semibold text-tinta shadow-lg shadow-acento/25 transition-all duration-300 hover:bg-acento-claro active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {cargando && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}

export default PrimaryButtonComponent
