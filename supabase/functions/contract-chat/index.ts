import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MAX_MESSAGES = 10

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // ── Auth ───────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── Parse body ─────────────────────────────────────────────────────────────
    const { analysis_id, message, conversation_history = [] } = await req.json() as {
      analysis_id: string
      message: string
      conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!analysis_id || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing analysis_id or message' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── Message limit ──────────────────────────────────────────────────────────
    const totalMessages = conversation_history.length + 1
    if (totalMessages > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: 'Message limit reached' }), {
        status: 429, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── Fetch analysis (ownership check) ───────────────────────────────────────
    const { data: analysis, error: dbError } = await supabase
      .from('analyses')
      .select('id, user_id, filename, puntuacion, result_json, law_version')
      .eq('id', analysis_id)
      .eq('user_id', user.id)
      .single()

    if (dbError || !analysis) {
      return new Response(JSON.stringify({ error: 'Analysis not found' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── Build system prompt with contract context ───────────────────────────────
    const result = analysis.result_json as {
      puntuacion: string
      last_updated: string
      clausulas: Array<{ titulo: string; estado: string; descripcion: string; accion: string }>
      recomendacion: string
    }

    const clausesSummary = result.clausulas
      .map((c) => `- [${c.estado.toUpperCase()}] ${c.titulo}: ${c.descripcion} → ${c.accion}`)
      .join('\n')

    const systemPrompt = `Eres un asistente experto en derecho arrendaticio español especializado en la LAU (Ley de Arrendamientos Urbanos).
El usuario tiene preguntas sobre su contrato de alquiler que ya fue analizado por la IA.

CONTEXTO DEL ANÁLISIS (normativa ${result.last_updated}):
Archivo: ${analysis.filename}
Puntuación global: ${result.puntuacion}
Recomendación principal: ${result.recomendacion}

CLÁUSULAS ANALIZADAS:
${clausesSummary}

INSTRUCCIONES:
- Responde basándote en el análisis anterior y la normativa LAU vigente
- Sé concreto y práctico — el usuario necesita saber qué hacer
- Si algo no está en el análisis, dilo claramente y da orientación general
- Máximo 3 párrafos por respuesta
- Usa lenguaje claro, no jerga legal innecesaria
- Siempre recuerda al final que tu respuesta es orientativa y no sustituye a un abogado si la pregunta es compleja`

    // ── Call Claude ────────────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...conversation_history,
      { role: 'user', content: message.trim() },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'No se pudo generar una respuesta.'

    return new Response(JSON.stringify({ response: assistantMessage }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('contract-chat error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
