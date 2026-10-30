// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import { buildWhatsappLink } from '../../agendaSlots'
import WhatsAppIconComponent from '../../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { formatTime as fmtHora, formatLongDate } from '../../../../../utils/dates'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import type { IRescheduleDoneProps } from './IRescheduleDoneProps'
// #endregion

/**
 * Contenido de la hoja una vez cambiada la cita: enseña la hora vieja y la
 * nueva y ofrece mandarle al cliente un WhatsApp ya escrito.
 */
const RescheduleDoneComponent: FunctionComponent<IRescheduleDoneProps> = ({ cita, inicioOriginal, inicioNuevo, onClose }) => {
  // #region Declaraciones, variables y hooks
  const nombre = cita.clienteNombre.split(' ')[0]
  const mensaje = `Hola ${nombre}, te he cambiado la cita al ${formatLongDate(inicioNuevo).toLowerCase()} a las ${fmtHora(inicioNuevo)}. ¡Nos vemos! Adrián`
  const whatsapp = buildWhatsappLink(cita.clienteMovil, mensaje)
  // #endregion

  // #region Renderizado
  return (
    <m.div
      className="flex flex-col items-center py-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_SMOOTH }}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CalendarCheck size={30} />
      </span>
      <p className="mt-4 font-display text-2xl font-bold">{cita.clienteNombre}</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-tinta/45 line-through">
          {formatLongDate(inicioOriginal)} · {fmtHora(inicioOriginal)}
        </span>
        <ArrowRight size={14} className="text-tinta/35" />
        <span className="font-semibold">
          {formatLongDate(inicioNuevo)} · {fmtHora(inicioNuevo)}
        </span>
      </p>

      {whatsapp ? (
        <>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <WhatsAppIconComponent size={20} /> Avisar a {nombre} por WhatsApp
          </a>
          <p className="mt-3 max-w-xs text-xs text-tinta/45">Se abre WhatsApp con el mensaje ya escrito; solo tienes que darle a enviar.</p>
        </>
      ) : (
        <p className="mt-6 text-sm text-tinta/50">Esta cita no tiene móvil: avísale tú.</p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-tinta/55 transition-colors hover:bg-tinta/5 hover:text-tinta"
      >
        Listo
      </button>
    </m.div>
  )
  // #endregion
}

export default RescheduleDoneComponent
