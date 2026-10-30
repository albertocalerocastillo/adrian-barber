// Mapa de iconos lucide-react usados en la web.
// Centralizar aquí evita imports dispersos y permite referenciar iconos
// por nombre desde los datos (p. ej. servicios.js → icono: 'Scissors').
import {
  Scissors,
  UserRound,
  Paintbrush,
  PaintBucket,
  Sparkles,
  Palette,
  Droplet,
  Baby,
  Clock,
  MapPin,
  Phone,
  CalendarCheck,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'

/** Iconos que se pueden nombrar desde los datos. */
export const ICONS: Record<string, LucideIcon> = {
  Scissors,
  UserRound,
  Paintbrush,
  PaintBucket,
  Sparkles,
  Palette,
  Droplet,
  Baby,
  Clock,
  MapPin,
  Phone,
  CalendarCheck,
  ChevronRight,
  Menu,
  X,
}
