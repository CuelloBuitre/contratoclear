import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type LetterType = 'impago' | 'actualizacion_renta' | 'preaviso_no_renovacion' | 'devolucion_fianza'

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

const SYSTEM_PROMPT = `Eres un abogado especializado en derecho arrendaticio español.
Redactas cartas legales formales basadas en la LAU vigente 2026.
Cada carta debe:
- Tener formato legal profesional con fecha, destinatario, asunto
- Citar el artículo LAU exacto que ampara la reclamación
- Ser clara, formal y sin ambigüedades
- Terminar con lugar, fecha y espacio para firma
- Estar en español formal
NO uses markdown en la carta. NO uses asteriscos para negrita. NO uses corchetes para placeholders. Escribe texto plano completamente formateado y listo para imprimir. Si necesitas énfasis usa MAYÚSCULAS. Usa siempre una ciudad real en la fecha, nunca [Lugar].
Varía ligeramente la redacción de cada carta para que no parezca siempre igual. Usa diferentes expresiones formales de apertura y cierre, pero mantén siempre el contenido legal correcto y los artículos citados.
Responde ONLY con el texto de la carta, sin explicaciones adicionales.`

function buildUserPrompt(letter_type: LetterType, d: Record<string, string>): string {
  switch (letter_type) {
    case 'impago':
      return `Redacta una carta de reclamación de impago de alquiler. Ciudad: ${d.ciudad}. Arrendador: ${d.nombre_arrendador}. Inquilino: ${d.nombre_inquilino}. Inmueble: ${d.direccion}. Meses impagados: ${d.meses}. Importe total: ${d.importe}€. Cita el Art. 27.2a LAU.`
    case 'actualizacion_renta':
      return `Redacta una carta de actualización de renta. Ciudad: ${d.ciudad}. Arrendador: ${d.nombre_arrendador}. Inquilino: ${d.nombre_inquilino}. Inmueble: ${d.direccion}. Renta actual: ${d.renta_actual}€. Nueva renta: ${d.renta_nueva}€. Índice INE aplicado: ${d.indice}%. Fecha efectiva: ${d.fecha_efectiva}. Cita el Art. 18 LAU y la Resolución INE 2024.`
    case 'preaviso_no_renovacion':
      return `Redacta una carta de preaviso de no renovación de contrato. Ciudad: ${d.ciudad}. Remitente: ${d.remitente}. Nombre remitente: ${d.nombre_remitente}. Nombre destinatario: ${d.nombre_destinatario}. Inmueble: ${d.direccion}. Fecha vencimiento contrato: ${d.fecha_vencimiento}. Cita el Art. 9.3 LAU (4 meses de preaviso arrendador, 2 meses inquilino).`
    case 'devolucion_fianza':
      return `Redacta una carta de reclamación de devolución de fianza. Ciudad: ${d.ciudad}. Inquilino: ${d.nombre_inquilino}. Arrendador: ${d.nombre_arrendador}. Inmueble: ${d.direccion}. Importe fianza: ${d.importe}€. Fecha entrega llaves: ${d.fecha_entrega}. Cita el Art. 36.4 LAU (plazo máximo 30 días).`
  }
}

const VALID_TYPES: LetterType[] = [
  'impago',
  'actualizacion_renta',
  'preaviso_no_renovacion',
  'devolucion_fianza',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Verify auth token ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No authorization header' }, 401)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Load profile ───────────────────────────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return json({ error: 'Profile not found' }, 404)

    // ── 3. Pro plan gate ──────────────────────────────────────────────────────
    if (profile.plan !== 'pro') return json({ error: 'pro_required' }, 403)

    // ── 4. Parse and validate body ────────────────────────────────────────────
    const { letter_type, contract_data } = await req.json() as {
      letter_type: LetterType
      contract_data: Record<string, string>
    }

    if (!letter_type || !contract_data) {
      return json({ error: 'Missing letter_type or contract_data' }, 400)
    }

    if (!VALID_TYPES.includes(letter_type)) {
      return json({ error: 'Invalid letter_type' }, 400)
    }

    // ── 5. Build prompt and call Claude with retry ────────────────────────────
    const userPrompt = buildUserPrompt(letter_type, contract_data)

    const claudeResponse = await callClaudeWithRetry({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const claudeData = await claudeResponse.json() as {
      content: Array<{ type: string; text: string }>
      error?: { message: string }
    }

    if (claudeData.error) {
      throw new Error(claudeData.error.message)
    }

    const rawContent = claudeData.content[0]
    if (rawContent.type !== 'text') throw new Error('Unexpected Claude response type')

    return json({
      letter_text: rawContent.text,
      letter_type,
      generated_at: new Date().toISOString(),
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json({ error: message }, 500)
  }
})
