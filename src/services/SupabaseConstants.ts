// Constantes de Supabase que usan los servicios. Van aparte del cliente
// (SupabaseService) porque el modo demo sustituye solo al cliente.

/** Mensaje cuando una operación necesita Supabase y no está configurado. */
export const ERROR_SIN_SUPABASE = 'Supabase no configurado.'

/** Código de Postgres cuando una cita pisa a otra (restricción citas_sin_solape). */
export const CODIGO_SOLAPE = '23P01'
