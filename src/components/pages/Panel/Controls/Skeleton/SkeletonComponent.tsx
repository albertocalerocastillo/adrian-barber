// #region Imports
import type { FunctionComponent } from 'react'
import type { ISkeletonProps } from './ISkeletonProps'
// #endregion

// #region Constantes
// Bloques por defecto.
const DEFAULT_ROWS = 3

// Retraso de la animación entre un bloque y el siguiente, en milisegundos.
const ROW_DELAY_MS = 120
// #endregion

/** Estado de "cargando" con esqueletos, mejor que un simple spinner. */
const SkeletonComponent: FunctionComponent<ISkeletonProps> = ({ rows = DEFAULT_ROWS, height = 'h-24' }) => {
  // #region Renderizado
  return (
    <div className="space-y-3" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`${height} animate-pulse rounded-2xl bg-tinta/[0.06]`} style={{ animationDelay: `${i * ROW_DELAY_MS}ms` }} />
      ))}
    </div>
  )
  // #endregion
}

export default SkeletonComponent
