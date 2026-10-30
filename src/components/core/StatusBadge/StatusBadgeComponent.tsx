// #region Imports
import type { FunctionComponent } from 'react'
import type { IStatusBadgeProps } from './IStatusBadgeProps'
// #endregion

/**
 * Badge en vivo de "Abierto ahora / Cerrado".
 *
 * Responde a la primera pregunta de cualquier cliente —¿puedo ir ya?—, así que
 * se usa tanto en el hero como en la sección de Horario.
 */
const StatusBadgeComponent: FunctionComponent<IStatusBadgeProps> = ({ status, light = false, href }) => {
  // #region Declaraciones, variables y hooks
  const abierto = status.abierto

  const colores = abierto
    ? light
      ? 'border-green-400/40 bg-green-400/15 text-green-200'
      : 'border-green-700/30 bg-green-100 text-green-800'
    : light
      ? 'border-hueso/25 bg-hueso/10 text-hueso/75'
      : 'border-tinta/15 bg-tinta/5 text-tinta/70'

  const texto = abierto
    ? `Abierto ahora · hasta las ${status.cierraA}`
    : status.abreA
      ? `Cerrado · abre ${status.proximoDia ? status.proximoDia.toLowerCase() : 'hoy'} a las ${status.abreA}`
      : 'Cerrado'

  const contenido = (
    <>
      {/* El punto parpadea solo cuando está abierto: llama la atención justo
          cuando el cliente puede venir ya. */}
      <span className="relative flex h-2 w-2">
        {abierto && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-70" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            abierto ? 'bg-green-500' : light ? 'bg-hueso/40' : 'bg-tinta/40'
          }`}
        />
      </span>
      {texto}
    </>
  )

  const clases = `inline-flex items-center gap-2 border px-4 py-2 text-xs font-medium uppercase tracking-widest ${colores}`
  // #endregion

  // #region Renderizado
  if (href) {
    return (
      <a href={href} className={`${clases} transition-opacity hover:opacity-80`}>
        {contenido}
      </a>
    )
  }

  return <span className={clases}>{contenido}</span>
  // #endregion
}

export default StatusBadgeComponent
