/** Propiedades de StepperComponent. */
export interface IStepperProps {
  /** Número actual. */
  value: number;
  /** Se llama con el número nuevo (ya redondeado y nunca por debajo de `min`). */
  onChange: (value: number) => void;
  /** Cuánto suma o resta cada botón. */
  step?: number;
  /** Valor mínimo. */
  min?: number;
  /** Unidad que se muestra detrás del número ("€", "min"). */
  suffix?: string;
  /** Nombre del dato, para los lectores de pantalla ("precio"). */
  label: string;
}
