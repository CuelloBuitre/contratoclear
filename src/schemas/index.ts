import { z } from 'zod'

export const clauseSchema = z.object({
  titulo: z.string(),
  estado: z.enum(['ok', 'advertencia', 'ilegal']),
  descripcion: z.string(),
  accion: z.string(),
})

export const analysisResultSchema = z.object({
  puntuacion: z.enum(['buena', 'aceptable', 'mala']),
  last_updated: z.string(),
  clausulas: z.array(clauseSchema).min(3).max(12),
  recomendacion: z.string(),
})

// Always validate Claude API responses with analysisResultSchema before saving to DB
