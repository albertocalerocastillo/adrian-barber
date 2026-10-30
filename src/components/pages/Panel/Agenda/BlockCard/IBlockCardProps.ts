import type { BloqueoDTO } from '../../../../../services/dtos/BloqueoDTO'

/** Propiedades de BlockCardComponent. */
export interface IBlockCardProps {
  /** Rato cerrado que se pinta. */
  bloqueo: BloqueoDTO;
  /** Vuelve a abrir el rato cerrado. */
  onQuitar: (bloqueo: BloqueoDTO) => void;
}
