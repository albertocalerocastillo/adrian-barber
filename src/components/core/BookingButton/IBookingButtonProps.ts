import type { ButtonVariantEnum } from '../../../services/enums/ButtonVariantEnum'
import type { ButtonSizeEnum } from '../../../services/enums/ButtonSizeEnum'

/** Propiedades de BookingButtonComponent. */
export interface IBookingButtonProps {
  /** Texto del botón; sin él se usa el de por defecto según el tamaño y la fase de la reserva. */
  text?: string;
  /** Estilo: dorado (por defecto) o con borde claro. */
  variant?: ButtonVariantEnum;
  /** Tamaño (mediano por defecto). */
  size?: ButtonSizeEnum;
  /** Clases extra. */
  className?: string;
}
