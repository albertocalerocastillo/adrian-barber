/** Fila de opciones donde se elige una (Día / Semana, Todo el día / Unas horas). */
const SegmentedControlComponent = ({ opciones, valor, onCambio, oscuro = false }) => {
  return (
    <div className={`inline-flex rounded-full p-1 ${oscuro ? 'bg-white/10' : 'bg-tinta/5'}`}>
      {opciones.map((o) => {
        const activa = o.valor === valor
        return (
          <button
            key={String(o.valor)}
            type="button"
            onClick={() => onCambio(o.valor)}
            aria-pressed={activa}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activa
                ? 'bg-tinta text-hueso shadow-md'
                : oscuro
                  ? 'text-hueso/60 hover:text-hueso'
                  : 'text-tinta/55 hover:text-tinta'
            }`}
          >
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControlComponent
