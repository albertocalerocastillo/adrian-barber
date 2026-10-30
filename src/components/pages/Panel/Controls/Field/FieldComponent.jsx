/** Etiqueta + campo, con el mismo aspecto en todos los formularios. */
const FieldComponent = ({ etiqueta, ayuda, children }) => {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-tinta/50">{etiqueta}</p>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-tinta/45">{ayuda}</p>}
    </div>
  )
}

export default FieldComponent
