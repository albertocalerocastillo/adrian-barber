// Ajustes comunes de las animaciones (Motion), para que toda la web se mueva
// con el mismo ritmo.
import type { CSSProperties } from 'react'

// Curva suave de toda la web (la misma que --ease-suave en theme.css).
export const EASE_SMOOTH: [number, number, number, number] = [0.2, 0.7, 0.2, 1]

// Muelle para lo que sigue al ratón o al scroll: rápido pero sin rebotar.
export const SPRING_SMOOTH = { stiffness: 140, damping: 22, mass: 0.6 }

/** Orden de aparición de un bloque al cargar (clase .entra de theme.css). */
export const entryOrder = (orden: number): CSSProperties => ({ '--orden': orden }) as CSSProperties
