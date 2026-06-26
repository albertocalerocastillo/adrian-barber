# A.S Barbería — Adrián Sánchez

Web de presentación y **reserva de citas online** para la barbería de Adrián
Sánchez (A.S Peluquería y Barbería), en La Rinconada, Sevilla.

## Stack

- React 19 + Vite 8
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Storage) — a partir de la Fase 2
- lucide-react · JavaScript (sin TypeScript)
- Deploy en Vercel

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Configuración (Fase 2+)

Copia `.env.example` a `.env` y rellena las credenciales de Supabase.
Sin `.env`, la web funciona con los datos estáticos de `src/data/`.

## Estado del proyecto

Ver [`ESTADO.md`](ESTADO.md) para el contexto completo, decisiones y pendientes.
