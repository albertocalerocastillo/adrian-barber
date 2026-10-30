import type { EstadoHuecoEnum } from '../enums/EstadoHuecoEnum'

/** Hora de inicio de la rejilla de reserva. */
export interface HuecoDTO {
  /** Hora de inicio. */
  inicio: Date;
  /** Si está libre u ocupada. */
  estado: EstadoHuecoEnum;
}
