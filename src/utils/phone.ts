// Móviles españoles: se escriben de mil formas y se guardan siempre igual (9 cifras).

// #region Constantes
// Móvil español: 6/7/8/9 + 8 cifras, sin prefijo.
const PATRON_MOVIL = /^[6789]\d{8}$/

// Separadores que se aceptan al escribir el móvil (espacios, puntos, guiones y paréntesis).
const PATRON_SEPARADORES_MOVIL = /[\s.()-]/g

// Prefijo de España que se quita (+34, 0034, o 34 delante de 9 cifras, como lo pega el autocompletado).
const PATRON_PREFIJO_ESPANA = /^(\+34|0034|34(?=\d{9}$))/
// #endregion

/** Móvil español en 9 cifras ("+34 600 12 34 56" → "600123456"); null si no lo es. */
export const limpiarMovil = (movil: string): string | null => {
  const solo = movil.replace(PATRON_SEPARADORES_MOVIL, '').replace(PATRON_PREFIJO_ESPANA, '')
  const result = PATRON_MOVIL.test(solo) ? solo : null
  return result
}
