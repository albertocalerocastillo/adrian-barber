// #region Imports
import type { FunctionComponent } from 'react'
import { CalendarX } from 'lucide-react'
import SheetComponent from '../Sheet/SheetComponent'
import WhatsAppIconComponent from '../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { buildCancelWhatsappLink } from '../agendaSlots'
import { formatTime as fmtHora, formatLongDate } from '../../../../utils/dates'
import type { ICancelDialogProps } from './ICancelDialogProps'
// #endregion

/**
 * Cancelar una cita. Si es Adrián quien la anula, el cliente tiene que
 * enterarse: el botón principal cancela y abre WhatsApp con el mensaje ya
 * escrito. Si fue el cliente quien avisó, "Solo cancelar" no le manda nada.
 * En los dos casos se puede deshacer desde el aviso de abajo.
 */
const CancelDialogComponent: FunctionComponent<ICancelDialogProps> = ({ cita, onClose, onCancelar }) => {
  // #region Declaraciones, variables y hooks
  const inicio = new Date(cita.inicio)
  const nombre = cita.clienteNombre.trim().split(' ')[0]
  const whatsapp = buildCancelWhatsappLink(cita)

  const cancelar = () => {
    onCancelar()
    onClose()
  }
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent
      title="Cancelar cita"
      subtitle="Si la anulas tú, avisa al cliente para que no venga."
      onClose={onClose}
      footer={
        <div className="space-y-2">
          {whatsapp && (
            // Es un enlace (no window.open después de guardar) para que el móvil no lo bloquee.
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={cancelar}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <WhatsAppIconComponent size={20} /> Cancelar y avisar a {nombre}
            </a>
          )}
          <button
            type="button"
            onClick={cancelar}
            className={`w-full rounded-full px-6 py-3.5 font-semibold transition-colors ${
              whatsapp ? 'text-red-600 hover:bg-red-50' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {whatsapp ? 'Solo cancelar (ya lo sabe)' : 'Cancelar la cita'}
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-4 rounded-3xl border border-hueso-200 bg-white p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <CalendarX size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{cita.clienteNombre}</p>
          <p className="text-sm text-tinta/60">
            {formatLongDate(inicio)} · {fmtHora(inicio)} · {cita.servicioNombre}
          </p>
        </div>
      </div>
      {!whatsapp && <p className="mt-4 text-sm text-tinta/55">Esta cita no tiene móvil: si hace falta, avísale tú.</p>}
    </SheetComponent>
  )
  // #endregion
}

export default CancelDialogComponent
