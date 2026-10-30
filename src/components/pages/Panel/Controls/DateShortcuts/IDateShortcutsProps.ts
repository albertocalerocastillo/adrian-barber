/** Propiedades de DateShortcutsComponent. */
export interface IDateShortcutsProps {
  /** Fecha elegida en formato "AAAA-MM-DD". */
  value: string;
  /** Se llama con la fecha nueva en formato "AAAA-MM-DD". */
  onChange: (value: string) => void;
}
