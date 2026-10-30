import type { HuecoLibre } from '../agendaUtils'

/** Propiedades de FreeSlotComponent. */
export interface IFreeSlotProps {
  /** Rato libre que se pinta. */
  hueco: HuecoLibre;
  /** Abre la hoja de nueva cita a la hora del hueco. */
  onNueva: () => void;
}
