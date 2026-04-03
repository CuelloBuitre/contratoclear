export type Plan = 'none' | 'single' | 'pack' | 'pro'
export type ClauseStatus = 'ok' | 'advertencia' | 'ilegal'
export type Puntuacion = 'buena' | 'aceptable' | 'mala' | 'error'

export interface Clause {
  titulo: string
  estado: ClauseStatus
  descripcion: string
  accion: string
}

export interface AnalysisResult {
  puntuacion: Puntuacion
  last_updated: string       // from ley-context.md — always show in UI
  clausulas: Clause[]
  recomendacion: string
}

export interface Profile {
  id: string
  email: string
  plan: Plan
  credits_remaining: number
  credits_expiry: string | null
  stripe_customer_id: string | null
  created_at: string
}

export interface Analysis {
  id: string
  user_id: string
  filename: string
  puntuacion: Puntuacion
  result_json: AnalysisResult
  law_version: string
  created_at: string
}
