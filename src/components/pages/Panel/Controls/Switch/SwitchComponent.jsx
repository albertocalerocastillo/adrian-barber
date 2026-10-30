/** Interruptor sí/no (más claro con el dedo que una casilla). */
const SwitchComponent = ({ activo, onCambio, etiqueta }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onCambio(!activo)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
        activo ? 'bg-acento' : 'bg-tinta/15'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-suave)] ${
          activo ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export default SwitchComponent
