import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Legal context (embedded — update this when laws change) ──────────────────
const LEY_CONTEXT = `---
last_updated: marzo 2026
version: 1.3
---

# Normativa LAU vigente en España — marzo 2026

## Leyes aplicables
- Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (base)
- Ley de Vivienda 12/2023, de 24 de mayo (vigor desde 26/05/2023)
- Real Decreto-Ley 9/2024, de 23 de diciembre (vigor desde 25/12/2024)
- Resolución INE 18/12/2024: nuevo índice de referencia de renta (vigor desde 01/01/2025)

## Reglas críticas

### Duración (Art. 9 LAU)
- Mínimo 5 años si arrendador es persona física
- Mínimo 7 años si arrendador es persona jurídica (empresa, SL, SA)
- Prórroga tácita automática de 3 años adicionales si nadie avisa
- Preaviso del arrendador: mínimo 4 meses antes del vencimiento
- Preaviso del arrendatario: mínimo 2 meses antes del vencimiento

### Fianza (Art. 36 LAU)
- Exactamente 1 mensualidad de renta en arrendamiento de vivienda
- Depósito obligatorio en organismo autonómico
- Devolución en máximo 30 días tras entrega de llaves
- Sin actualización durante los primeros 5 años (7 si persona jurídica)

### Garantías adicionales (Art. 36.5 LAU)
- Máximo 2 mensualidades adicionales a la fianza legal
- Total máximo: 3 meses (1 fianza + 2 garantía adicional)
- Exigir más de 2 meses adicionales es ILEGAL y la cláusula es nula

### Actualización de renta (Art. 18 LAU + Ley 12/2023 + Resolución INE 2024)
- Desde 01/01/2025: solo se puede usar el Índice de Referencia del INE
- El IPC ya NO es válido como referencia para subidas
- Porcentajes fijos que superen el índice INE son ilegales
- Índice INE 2025: ~2,2% (verificar en ine.es para el año en curso)
- En zonas tensionadas: renta nueva no puede superar la del contrato anterior

### Gastos (Art. 20 LAU modificado por Ley 12/2023)
- Gastos de gestión inmobiliaria: SIEMPRE a cargo del arrendador
- Gastos de formalización del contrato: SIEMPRE a cargo del arrendador
- Aplica tanto a personas físicas como jurídicas
- Pactar que el inquilino los pague es ilegal

### Acceso al inmueble
- El arrendador NO puede entrar sin consentimiento previo del arrendatario
- Ninguna cláusula puede otorgar acceso libre al arrendador
- Viola el Art. 18 CE (inviolabilidad del domicilio) — es nula aunque esté firmada

### Obras (Art. 23-26 LAU)
- Obras de accesibilidad: el arrendatario puede hacerlas sin permiso si tiene discapacidad
- Otras obras de mejora: requieren permiso escrito del arrendador
- El arrendador puede exigir reponer el estado original al finalizar

### Prórroga extraordinaria (Ley 12/2023)
- Inquilino en vulnerabilidad acreditada puede pedir prórroga de hasta 1 año
- El arrendador debe aceptarla salvo necesidad justificada de la vivienda

### Resolución del contrato
- Causas legítimas del arrendador: impago, subarriendo no autorizado, daños graves
- La pérdida automática de fianza sin proceso judicial es discutible legalmente
- El desahucio requiere siempre proceso judicial`

// ── Retry helper ─────────────────────────────────────────────────────────────
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

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_PDF_BYTES = 10 * 1024 * 1024  // 10 MB
const RATE_LIMIT_PER_HOUR = 10          // max analyses/hour for non-pro users

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Verify auth token ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'No authorization header' }, 401)
    }

    // Per-request anon client — forwards the user's JWT so getUser() validates it
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Unauthorized', details: authError?.message }, 401)
    }

    // Admin client — service role, used only for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ── 2. Load profile ───────────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan, credits_remaining, credits_expiry')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return json({ error: 'Profile not found' }, 404)
    }

    // ── 3. Plan-based access control ──────────────────────────────────────────
    // plan === 'none': no credits, reject immediately
    if (profile.plan === 'none') {
      return json({ error: 'no_credits' }, 403)
    }

    const isPro = profile.plan === 'pro'

    // Non-pro: check credits
    if (!isPro) {
      const creditsExpired =
        profile.credits_expiry && new Date(profile.credits_expiry) < new Date()

      if (profile.credits_remaining <= 0 || creditsExpired) {
        return json({ error: 'no_credits' }, 402)
      }
    }

    // ── 4. Rate limiting (non-pro: max 10/hour) ───────────────────────────────
    if (!isPro) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { count, error: countError } = await supabaseAdmin
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo)

      if (!countError && count !== null && count >= RATE_LIMIT_PER_HOUR) {
        return json({ error: 'rate_limit_exceeded' }, 429)
      }
    }

    // ── 5. Parse and validate request body ────────────────────────────────────
    const { pdfBase64, filename } = await req.json() as {
      pdfBase64: string
      filename: string
    }

    if (!pdfBase64 || !filename) {
      return json({ error: 'Missing pdfBase64 or filename' }, 400)
    }

    // PDF size check: base64 encodes at ~4/3 ratio, so multiply by 0.75 for byte estimate
    const estimatedPdfBytes = Math.floor(pdfBase64.length * 0.75)
    if (estimatedPdfBytes > MAX_PDF_BYTES) {
      return json({ error: 'pdf_too_large' }, 400)
    }

    // ── 6. Build prompts from embedded legal context ──────────────────────────
    const lastUpdatedMatch = LEY_CONTEXT.match(/last_updated:\s*(.+)/)
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : 'fecha desconocida'

    const SYSTEM_PROMPT = `Eres un experto en derecho arrendaticio español.
Analizas contratos de alquiler de vivienda habitual en España.
Respondes SOLO con JSON válido, sin texto adicional ni backticks markdown.

Normativa LAU vigente que DEBES aplicar:

${LEY_CONTEXT}`

    const USER_PROMPT = `Analiza este contrato y devuelve exactamente este JSON:
{
  "puntuacion": "buena" | "aceptable" | "mala",
  "last_updated": "${lastUpdated}",
  "clausulas": [
    {
      "titulo": "nombre corto (max 4 palabras)",
      "estado": "ok" | "advertencia" | "ilegal",
      "descripcion": "qué dice y por qué es ok/problemática en lenguaje claro (max 2 frases)",
      "accion": "qué debe hacer el inquilino (max 1 frase)"
    }
  ],
  "recomendacion": "consejo más importante en 2-3 frases"
}

Analiza entre 6 y 9 cláusulas: fianza, garantías adicionales, duración, prórrogas,
renta y actualización, gastos de gestión, obras, acceso del arrendador, subarriendo, resolución.
"ilegal" = infringe la normativa inyectada. "advertencia" = perjudicial pero legal. "ok" = correcto.

Si el contrato contiene cláusulas inusuales, poco comunes o no listadas anteriormente que potencialmente infrinjan la LAU, vulneren derechos del inquilino o sean desproporcionadamente favorables al arrendador, inclúyelas también en el análisis. No te limites a las cláusulas listadas — analiza todo el contrato.

Si el PDF no contiene texto extraíble (parece ser una imagen escaneada), devuelve exactamente este JSON de error:
{
  "puntuacion": "error",
  "last_updated": "${lastUpdated}",
  "clausulas": [],
  "recomendacion": "El documento parece ser una imagen escaneada y no contiene texto extraíble. Por favor, usa un PDF con texto seleccionable o solicita al arrendador una versión digital del contrato."
}`

    // ── 7. Call Claude API with retry ─────────────────────────────────────────
    const claudeResponse = await callClaudeWithRetry({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: USER_PROMPT,
            },
          ],
        },
      ],
    })

    const claudeData = await claudeResponse.json() as {
      content: Array<{ type: string; text: string }>
      error?: { message: string }
    }

    if (claudeData.error) {
      throw new Error(claudeData.error.message)
    }

    const rawContent = claudeData.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Unexpected Claude response type')
    }

    const analysisResult = JSON.parse(rawContent.text)

    // ── 8. Save analysis to DB ────────────────────────────────────────────────
    const { data: analysis, error: insertError } = await supabaseAdmin
      .from('analyses')
      .insert({
        user_id: user.id,
        filename,
        puntuacion: analysisResult.puntuacion,
        result_json: analysisResult,
        law_version: lastUpdated,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to save analysis: ${insertError.message}`)
    }

    // ── 9. Decrement credits atomically (skip for pro) ────────────────────────
    if (!isPro) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq('id', user.id)
    }

    return json({ analysis })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json({ error: message }, 500)
  }
})
