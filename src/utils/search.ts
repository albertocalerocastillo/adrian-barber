// Utilidades de búsqueda: buscar nombres sin que importen tildes ni mayúsculas.

// #region Constantes
// Cada letra base con sus variantes acentuadas (minúsculas y mayúsculas).
const VARIANTES: Record<string, string> = {
  a: 'aáàâäAÁÀÂÄ',
  e: 'eéèêëEÉÈÊË',
  i: 'iíìîïIÍÌÎÏ',
  o: 'oóòôöOÓÒÔÖ',
  u: 'uúùûüUÚÙÛÜ',
  n: 'nñNÑ',
  c: 'cçCÇ',
}

// Marcas de acento que quedan sueltas al descomponer el texto (NFD).
const PATRON_ACENTOS = /[̀-ͯ]/g

// Lo que no es letra, cifra ni espacio (en el patrón vale por cualquier carácter).
const PATRON_SIMBOLOS = /[^\p{L}\p{N} ]/u
// #endregion

/** Quita tildes y pasa a minúsculas: "José" → "jose". */
export const sinTildes = (texto: string): string => texto.normalize('NFD').replace(PATRON_ACENTOS, '').toLowerCase()

/**
 * Expresión regular (válida en Postgres y en JavaScript) que encuentra el
 * texto ignorando tildes: "jose" → "j[oóòôö…]s[eéèêë…]". Se usa con el
 * operador `imatch` de Supabase, que además ignora mayúsculas. Los símbolos
 * se cambian por "." para que nunca rompan la expresión.
 */
export const patronSinTildes = (texto: string): string =>
  [...sinTildes(texto)]
    .map((letra) => {
      if (VARIANTES[letra]) return `[${VARIANTES[letra]}]`
      if (PATRON_SIMBOLOS.test(letra)) return '.'
      return letra
    })
    .join('')
