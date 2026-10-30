// #region Imports
import type { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import WhatsAppIconComponent from '../WhatsAppIcon/WhatsAppIconComponent'
import { reservaEmpezada } from '../../../data/features'
import { WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contact'
import type { IBookingButtonProps } from './IBookingButtonProps'
import { ButtonVariantEnum } from '../../../services/enums/ButtonVariantEnum'
import { ButtonSizeEnum } from '../../../services/enums/ButtonSizeEnum'
// #endregion

// #region Constantes
const VARIANTS = {
  accent:
    'bg-acento text-tinta hover:bg-acento-claro shadow-lg shadow-acento/20',
  outline:
    'border border-hueso/40 text-hueso hover:bg-hueso hover:text-tinta',
}

const SIZES = {
  md: 'px-7 py-3.5 text-xs',
  lg: 'px-6 py-4 text-xs min-[400px]:px-8 sm:px-9 sm:text-sm lg:px-7 xl:px-9',
}

// Tamaño del icono en el botón grande y en el normal.
const ICON_SIZE_LG = 20
const ICON_SIZE_MD = 18
// #endregion

/**
 * Botón principal "Pedir cita" — la acción estrella de toda la web.
 *  - Con la reserva online ya en marcha: lleva a /reserva.
 *  - Antes (o con la reserva apagada): abre WhatsApp con el mensaje
 *    predefinido. El cambio es automático el día que empieza la reserva
 *    (RESERVA.desde en data/features.ts).
 */
const BookingButtonComponent: FunctionComponent<IBookingButtonProps> = ({
  text,
  variant = ButtonVariantEnum.Accent,
  size = ButtonSizeEnum.Md,
  className = '',
}) => {
  // #region Declaraciones, variables y hooks
  // Con la reserva apagada, los botones grandes dicen que se abre WhatsApp;
  // en el pequeño (menú) no cabe y basta con el icono.
  const online = reservaEmpezada()
  const porDefecto = size !== ButtonSizeEnum.Lg ? 'Pedir cita' : online ? 'Reservar cita' : 'Pedir cita por WhatsApp'
  const etiqueta = text ?? porDefecto

  const clases = `group inline-flex items-center justify-center gap-2.5 whitespace-nowrap al-tocar font-semibold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const medida = size === ButtonSizeEnum.Lg ? ICON_SIZE_LG : ICON_SIZE_MD
  // #endregion

  // #region Renderizado
  // Sin reserva online (aún) → el botón contacta por WhatsApp. Se usa el
  // icono de WhatsApp (y no un calendario) para que se vea de antemano que
  // se abre el chat, y no una pantalla de reserva.
  if (!online) {
    const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className={clases}
      >
        <WhatsAppIconComponent size={medida} />
        {etiqueta}
      </a>
    )
  }

  // Reserva online en marcha.
  return (
    <Link to="/reserva" className={clases}>
      <CalendarCheck size={medida} strokeWidth={2} />
      {etiqueta}
    </Link>
  )
  // #endregion
}

export default BookingButtonComponent
