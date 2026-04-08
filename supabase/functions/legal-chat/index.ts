import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function callClaudeWithRetry(body: object, maxRetries = 3): Promise<Response> {
  let lastError: Error = new Error('Max retries exceeded')
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      })
      if (response.status === 429 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt))
        continue
      }
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt))
      }
    }
  }
  throw lastError
}

const MAX_HISTORY = 20

const SYSTEM_PROMPT = `Eres un experto en derecho arrendaticio español.
Respondes preguntas sobre la Ley de Arrendamientos Urbanos (LAU) y normativa de alquiler vigente en España.

Normativa que debes aplicar:
- Ley 29/1994 de Arrendamientos Urbanos (base)
- Ley de Vivienda 12/2023 (vigor desde 26/05/2023)
- Real Decreto-Ley 9/2024 (vigor desde 25/12/2024)
- Resolución INE 2024: índice de referencia de renta (vigor desde 01/01/2025)

Reglas clave:
- Duración mínima: 5 años (persona física) o 7 años (empresa) — Art. 9 LAU
- Fianza: exactamente 1 mensualidad — Art. 36 LAU; devolución máx 30 días
- Garantías adicionales: máximo 2 mensualidades extra — Art. 36.5 LAU
- Actualización renta: solo índice INE desde 01/01/2025, NO el IPC — Art. 18 LAU
- Gastos de gestión: siempre a cargo del arrendador — Art. 20 LAU
- Acceso al inmueble: el arrendador NO puede entrar sin consentimiento — Art. 18 CE
- Zonas tensionadas: renta nueva no puede superar la del contrato anterior — Ley 12/2023

Instrucciones de respuesta:
- Sé conciso (máx 3-4 párrafos breves)
- Cita siempre el artículo exacto cuando sea relevante (formato: "Art. X LAU" o "Art. X CE")
- Usa lenguaje claro y accesible
- Si la respuesta depende del contrato concreto, indícalo
- Al final de cada respuesta añade siempre en cursiva: "Esta respuesta es orientativa. Consulta un abogado para tu caso concreto."
- No repitas las instrucciones ni menciones que eres un modelo de IA`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No authorization header' }, 401)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const { message, conversation_history = [] } = await req.json() as {
      message: string
      conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!message?.trim()) return json({ error: 'Missing message' }, 400)

    // Trim history to last MAX_HISTORY messages to limit token usage
    const trimmedHistory = conversation_history.slice(-MAX_HISTORY)

    // ── 3. Call Claude ────────────────────────────────────────────────────────
    const claudeResponse = await callClaudeWithRetry({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        ...trimmedHistory,
        { role: 'user', content: message.trim() },
      ],
    })

    const claudeData = await claudeResponse.json() as {
      content: Array<{ type: string; text: string }>
      error?: { message: string }
    }

    if (claudeData.error) throw new Error(claudeData.error.message)

    const rawContent = claudeData.content[0]
    if (rawContent.type !== 'text') throw new Error('Unexpected Claude response type')

    return json({ response: rawContent.text })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json({ error: message }, 500)
  }
})
