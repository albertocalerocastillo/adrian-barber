// #region Imports
import type { FunctionComponent } from 'react'
import { Ban } from 'lucide-react'
import { formatTime as fmtHora } from '../../../../../utils/dates'
import { MINUTES_PER_DAY } from '../../../../../utils/availability'
import { minutos } from '../agendaUtils'
import type { IBlockCardProps } from './IBlockCardProps'
// #endregion

/** Rato cerrado en la vista día, con el botón para volver a abrirlo. */
const BlockCardComponent: FunctionComponent<IBlockCardProps> = ({ bloqueo, onQuitar }) => {
  // #region Declaraciones, variables y hooks
  const ini = new Date(bloqueo.inicio)
  const fin = new Date(bloqueo.fin)
  const diaEntero = minutos(ini, fin) >= MINUTES_PER_DAY - 1
  // #endregion

  // #region Renderizado
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-tinta/10 bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,rgb(22_32_42/0.04)_8px,rgb(22_32_42/0.04)_16px)] px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tinta/10 text-tinta/60">
          <Ban size={16} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{bloqueo.motivo || 'Cerrado'}</p>
          <p className="text-sm text-tinta/50">{diaEntero ? 'Todo el día' : `${fmtHora(ini)} – ${fmtHora(fin)}`}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onQuitar(bloqueo)}
        className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-tinta/50 transition-colors hover:bg-tinta/5 hover:text-tinta"
      >
        Abrir
      </button>
    </div>
  )
  // #endregion
}

export default BlockCardComponent
