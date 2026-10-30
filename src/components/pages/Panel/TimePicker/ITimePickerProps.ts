import type { HuecoDTO } from '../../../../services/dtos/HuecoDTO'

/** Propiedades de TimePickerComponent. */
export interface ITimePickerProps {
  /** Horas libres del día; null mientras se cargan. */
  slots: HuecoDTO[] | null;
  /** Hora elegida (ISO); vacía si aún no hay ninguna. */
  value: string;
  /** Se llama con el ISO de la hora tocada. */
  onChange: (value: string) => void;
}
