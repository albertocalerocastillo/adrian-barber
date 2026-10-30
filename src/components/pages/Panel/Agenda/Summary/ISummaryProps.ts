import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'

/** Propiedades de SummaryComponent. */
export interface ISummaryProps {
  /** Citas del día (también las canceladas, que no cuentan). */
  citas: CitaDTO[];
  /** Precio de cada servicio, por nombre. */
  precios: ReadonlyMap<string, number>;
}
