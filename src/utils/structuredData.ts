// Datos estructurados (JSON-LD) del index.html: lo que lee Google del negocio.
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import { especificacionHorario } from './schedule'

// #region Constantes
// Bloque de datos estructurados del index.html.
const SELECTOR_JSON_LD = 'script[type="application/ld+json"]'
// #endregion

/**
 * Pone en los datos estructurados de la página el horario real (el de
 * Supabase, que Adrián cambia desde el panel). El index.html ya trae el
 * horario estático puesto al compilar; esto lo corrige si en Supabase es
 * distinto, para que Google (que ejecuta el JavaScript) lea siempre el bueno.
 */
export const actualizarHorarioEnDatosEstructurados = (horario: HorarioDiaDTO[]): void => {
  const bloque = document.querySelector(SELECTOR_JSON_LD)
  if (!bloque?.textContent) return
  // Si el bloque no es JSON válido no se toca: mejor el horario estático que nada.
  try {
    const datos = JSON.parse(bloque.textContent) as Record<string, unknown>
    datos.openingHoursSpecification = especificacionHorario(horario)
    bloque.textContent = JSON.stringify(datos, null, 2)
  } catch {
    // Sin cambios.
  }
}
