import type { EstadoCitaEnum } from '../enums/EstadoCitaEnum'

/** Cita completa, tal como la ve el panel (tabla `citas`, en camelCase). */
export interface CitaDTO {
  /** Identificador de la cita. */
  id: number | string;
  /** Nombre del servicio (se guarda el nombre, no el id, para el histórico). */
  servicioNombre: string;
  /** Nombre del cliente. */
  clienteNombre: string;
  /** Móvil del cliente (9 cifras, puede venir vacío en citas manuales). */
  clienteMovil: string;
  /** Inicio de la cita (ISO). */
  inicio: string;
  /** Fin de la cita (ISO). */
  fin: string;
  /** Estado de la cita. */
  estado: EstadoCitaEnum;
  /** Notas de Adrián. */
  notas: string | null;
}
