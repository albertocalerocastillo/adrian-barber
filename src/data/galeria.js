// Galería de trabajos de A.S Barbería.
//
// 📸 CÓMO AÑADIR FOTOS (sin tocar código):
//    Suelta las imágenes (.jpg .jpeg .png .webp) en:
//        src/assets/galeria/
//    Y aparecen solas en la web, optimizadas por Vite. El ORDEN se controla
//    con el nombre del archivo (se ordenan descendente), así que nombrarlas
//    p. ej. 2026-01.jpg, 2026-02.jpg, 2025-01.jpg… las muestra de más nueva
//    a más antigua. No hace falta editar nada más.
//
// Si la carpeta está vacía, la web usa fotos de ejemplo (placeholders) para no
// verse coja.

// Vite incluye en el build todas las imágenes de la carpeta (import.meta.glob).
const modulos = import.meta.glob(
  '../assets/galeria/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' }
)

const fotosLocales = Object.entries(modulos)
  // Orden ascendente y "natural" (corte-2 antes que corte-10).
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([ruta, url]) => ({
    id: ruta,
    src: url,
    alt: 'Corte de pelo y barba en A.S Peluquería y Barbería, La Rinconada (Sevilla)',
  }))

// Placeholders (solo si aún no hay fotos reales en src/assets/galeria/).
const PLACEHOLDERS = [
  { id: 'ph1', src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80', alt: 'Corte de pelo degradado clásico en barbería de La Rinconada, Sevilla', alto: 'tall' },
  { id: 'ph2', src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&q=80', alt: 'Arreglo de barba a navaja en A.S Peluquería y Barbería, La Rinconada' },
  { id: 'ph3', src: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=900&q=80', alt: 'Detalle de degradado lateral, barbería en La Rinconada (Sevilla)' },
  { id: 'ph4', src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=900&q=80', alt: 'Corte de pelo moderno con textura en A.S Peluquería y Barbería', alto: 'tall' },
  { id: 'ph5', src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=80', alt: 'Afeitado clásico con toalla caliente, barbería en La Rinconada' },
  { id: 'ph6', src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=900&q=80', alt: 'Peinado y perfilado, peluquería en La Rinconada (Sevilla)' },
]

export const GALERIA = fotosLocales.length ? fotosLocales : PLACEHOLDERS
export const HAY_FOTOS_REALES = fotosLocales.length > 0
