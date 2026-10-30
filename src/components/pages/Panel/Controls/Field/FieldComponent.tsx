// #region Imports
import type { FunctionComponent } from 'react'
import type { IFieldProps } from './IFieldProps'
// #endregion

/** Etiqueta + campo, con el mismo aspecto en todos los formularios. */
const FieldComponent: FunctionComponent<IFieldProps> = ({ label, help, children }) => {
  // #region Renderizado
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-tinta/50">{label}</p>
      {children}
      {help && <p className="mt-1.5 text-xs text-tinta/45">{help}</p>}
    </div>
  )
  // #endregion
}

export default FieldComponent
