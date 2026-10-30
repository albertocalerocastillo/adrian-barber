/** Propiedades de SwitchComponent. */
export interface ISwitchProps {
  /** Si el interruptor está encendido. */
  active: boolean;
  /** Se llama con el valor nuevo al tocarlo. */
  onChange: (active: boolean) => void;
  /** Texto para lectores de pantalla (no se ve). */
  label: string;
}
