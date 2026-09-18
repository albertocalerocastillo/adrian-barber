/**
 * Badge en vivo de "Abierto ahora / Cerrado".
 *
 * Responde a la primera pregunta de cualquier cliente —¿puedo ir ya?—, así que
 * se usa tanto en el hero como en la sección de Horario.
 *
 * Props:
 *  - estado: lo que devuelve useEstadoNegocio().
 *  - claro: true sobre fondos oscuros (hero).
 */
export default function EstadoBadgeComponent({ estado, claro = false }) {
  const abierto = estado.abierto

  const colores = abierto
    ? claro
      ? 'border-green-400/40 bg-green-400/15 text-green-200'
      : 'border-green-700/30 bg-green-100 text-green-800'
    : claro
      ? 'border-hueso/25 bg-hueso/10 text-hueso/75'
      : 'border-tinta/15 bg-tinta/5 text-tinta/70'

  const texto = abierto
    ? `Abierto ahora · hasta las ${estado.cierraA}`
    : estado.abreA
      ? `Cerrado · abre ${estado.proximoDia ? estado.proximoDia.toLowerCase() : 'hoy'} a las ${estado.abreA}`
      : 'Cerrado'

  return (
    <span
      className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-medium uppercase tracking-widest ${colores}`}
    >
      {/* El punto parpadea solo cuando está abierto: llama la atención justo
          cuando el cliente puede venir ya. */}
      <span className="relative flex h-2 w-2">
        {abierto && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-70" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            abierto ? 'bg-green-500' : claro ? 'bg-hueso/40' : 'bg-tinta/40'
          }`}
        />
      </span>
      {texto}
    </span>
  )
}
