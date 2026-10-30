import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de ServiceStepComponent. */
export interface IServiceStepProps {
  /** Servicios que se reservan online; null mientras se cargan. */
  servicios: ServicioDTO[] | null;
  /** Servicio elegido hasta ahora (null si aún no hay). */
  servicio: ServicioDTO | null;
  /** Se llama al pulsar un servicio. */
  onElegir: (servicio: ServicioDTO) => void;
  /** Servicios que solo se piden por WhatsApp (mechas, tinte…). */
  soloWhatsapp?: ServicioDTO[];
}
