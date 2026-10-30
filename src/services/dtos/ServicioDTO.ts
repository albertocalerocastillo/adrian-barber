/** Servicio de la barbería, tal como lo usa la app. */
export interface ServicioDTO {
  /** Identificador (numérico en Supabase, de texto en los datos estáticos). */
  id: number | string;
  /** Nombre del servicio. */
  nombre: string;
  /** Descripción para la web. */
  descripcion: string;
  /** Duración en minutos. */
  duracion: number;
  /** Precio en euros. */
  precio: number;
  /** Nombre del icono de lucide-react (ver theme/icons). */
  icono: string;
  /** Si se destaca en la web. */
  destacado: boolean;
  /** Si se ofrece (los inactivos no salen en la web). */
  activo?: boolean;
  /** Si se puede reservar online; si no, solo por WhatsApp. */
  online?: boolean;
}
