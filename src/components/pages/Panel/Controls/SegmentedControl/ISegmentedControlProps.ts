/** Una opción de SegmentedControlComponent. */
export interface ISegmentedControlOption {
  /** Valor que se devuelve al elegirla. */
  value: string | number | boolean;
  /** Texto del botón. */
  text: string;
}

/** Propiedades de SegmentedControlComponent. */
export interface ISegmentedControlProps {
  /** Opciones entre las que se elige una. */
  options: ISegmentedControlOption[];
  /** Valor de la opción elegida. */
  value: ISegmentedControlOption['value'];
  /** Se llama con el valor de la opción tocada. */
  onChange: (value: ISegmentedControlOption['value']) => void;
  /** Colores para fondos oscuros. */
  dark?: boolean;
}
