import type { ToastTypeEnum } from '../../../../services/enums/ToastTypeEnum'

/** Lo que se pasa a useToast() para mostrar un aviso. */
export interface IToastOptions {
  /** Texto del aviso. */
  text: string;
  /** Tipo de aviso (por defecto, Ok). */
  type?: ToastTypeEnum;
  /** Si se pasa, el aviso ofrece "Deshacer" y esto se llama al tocarlo. */
  onUndo?: () => void | Promise<void>;
}
