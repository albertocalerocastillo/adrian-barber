import type { PasoReservaEnum } from '../../../../services/enums/PasoReservaEnum'

/** Propiedades de StepIndicatorComponent. */
export interface IStepIndicatorProps {
  /** Paso en el que está el cliente. */
  paso: PasoReservaEnum;
  /** Se llama al pulsar un paso (solo se pueden pulsar los ya hechos). */
  onIr: (paso: PasoReservaEnum) => void;
}
