// #region Imports
import { useState } from 'react'
import type { FunctionComponent } from 'react'
import { Check } from 'lucide-react'
import WhatsAppIconComponent from '../../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { buildCancelWhatsappLink } from '../../agendaSlots'
import { formatTime as fmtHora } from '../../../../../utils/dates'
import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { IAffectedAppointmentsProps } from './IAffectedAppointmentsProps'
// #endregion

/**
 * Citas que caen en un día libre. Antes de cerrar avisa de cuáles son; una
 * vez cerrado, cada una lleva su WhatsApp ya escrito para avisar al cliente
 * (y se marca como avisada al tocarlo, para no repetir a nadie).
 */
const AffectedAppointmentsComponent: FunctionComponent<IAffectedAppointmentsProps> = ({ citas, conAviso = false }) => {
  // #region Declaraciones, variables y hooks
  const [avisadas, setAvisadas] = useState<CitaDTO['id'][]>([])
  // #endregion

  // #region Renderizado
  return (
    <ul className="space-y-2">
      {citas.map((c) => {
        const inicio = new Date(c.inicio)
        const nombre = c.clienteNombre.trim().split(' ')[0]
        const whatsapp = conAviso ? buildCancelWhatsappLink(c) : null
        const avisada = avisadas.includes(c.id)
        return (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-hueso-200">
            <span className="w-12 shrink-0 font-semibold tabular-nums">{fmtHora(inicio)}</span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-semibold">{c.clienteNombre}</span>
              <span className="block truncate text-tinta/55">{c.servicioNombre}</span>
            </span>
            {conAviso && whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAvisadas((a) => [...a, c.id])}
                aria-label={`Avisar a ${nombre} por WhatsApp`}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  avisada ? 'bg-green-100 text-green-700' : 'bg-[#25D366] text-white hover:bg-[#1ebe5a]'
                }`}
              >
                {avisada ? <Check size={14} /> : <WhatsAppIconComponent size={14} />}
                {avisada ? 'Avisado' : 'Avisar'}
              </a>
            )}
            {conAviso && !whatsapp && <span className="shrink-0 text-xs text-tinta/45">Sin móvil</span>}
          </li>
        )
      })}
    </ul>
  )
  // #endregion
}

export default AffectedAppointmentsComponent
