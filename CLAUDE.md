# ClausulaAI — Project Bible for Claude CLI

> **This file is the single source of truth for the entire project.**
> Read it completely before touching any file. Every architectural decision is here and justified.

---

## What is this project

ClausulaAI is a paid web app (SPA) that analyzes Spanish rental contracts using AI. Users upload a PDF and receive a detailed legal analysis: correct clauses, warnings, and illegal clauses under Spanish LAU.

**Key differentiator:** The Edge Function injects `ley-context.md` into every Claude API call at runtime. When a new law passes, update that single file — no redeploy needed. The UI shows "Actualizado a [date]" on every analysis, which is a trust signal competitors don't have.

**Business model:** Paid from day one. No free tier. No freemium.
- 1 analysis: 3.99€ (one-time Stripe payment)
- Pack 3 analyses: 9.99€ (one-time, credits expire after 90 days)
- Pro plan: 19€/month (unlimited, recurring Stripe subscription)

**Target users:**
- People about to sign a rental contract (primary)
- People who already signed and suspect abusive clauses (illegal clauses are null even if signed)
- Real estate agents and property managers (Pro plan)

---

## Tech Stack — Versions locked

| Layer | Technology | Version | Why |
|---|---|---|---|
| Runtime | Node.js | 18.x (user has 18.18.1) | Sufficient, upgrade to 20 LTS later if needed |
| Frontend | React + TypeScript | **19** | Stable since Dec 2024, current standard |
| Build | Vite | **6.x** | Fastest, native React 19 support |
| Styles | Tailwind CSS | **v4** | No config file — pure CSS @import, faster |
| Components | shadcn/ui | **latest** | Full React 19 + Tailwind v4 support |
| Animations | Framer Motion | **v12** | Page transitions, useCountUp, reduced-motion aware |
| PDF export | @react-pdf/renderer | **v4** | Generate downloadable analysis PDFs |
| Routing | React Router | **v7** (SPA mode) | Proven, simple, no SSR needed |
| Server state | TanStack Query | **v5** | Supabase data caching + background sync |
| Client state | Zustand | **v5** | UI state, upload state, auth state |
| Forms | React Hook Form + Zod | **latest** | Type-safe forms and validation |
| i18n | i18next + react-i18next | **v23** | Spanish first, ready for EN/CA |
| Auth | Supabase Auth | **2.x** | Email + Google OAuth |
| Database | Supabase PostgreSQL | **2.x** | profiles + analyses tables |
| AI | Claude API (Sonnet 4.6) | via Edge Function | API key NEVER in frontend |
| Payments | Stripe | **latest** | Cards + Apple Pay + Google Pay + SEPA |
| Backend | Supabase Edge Functions | Deno | analyze-contract + stripe-webhook |
| Testing | Vitest + Testing Library | **latest** | Jest-compatible, runs on Vite |
| Error tracking | @sentry/react | **v8** | Production error monitoring (imported directly, no sentry.ts wrapper) |
| Deploy | Vercel | — | Auto-deploy from GitHub main |

---

## Project Structure

```
contratoclear/
├── public/
│   └── locales/
│       ├── es/translation.json         # Spanish (primary)
│       └── en/translation.json         # English (future)
├── src/
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (auto-generated, do not edit)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── analysis/
│   │   │   ├── UploadZone.tsx          # PDF drag & drop upload
│   │   │   ├── AnalysisReport.tsx      # Full results display
│   │   │   ├── AnalysisLoader.tsx      # Loading skeleton while analysis runs
│   │   │   ├── AnalysisPDFReport.tsx   # @react-pdf/renderer — downloadable PDF
│   │   │   ├── ClauseCard.tsx          # Single clause (expandable)
│   │   │   ├── ContractChat.tsx        # AI chat widget about the contract (10 msg limit)
│   │   │   ├── LegalUpdateBadge.tsx    # "Actualizado a [date]" trust badge
│   │   │   └── ScoreBadge.tsx          # buena/aceptable/mala badge
│   │   ├── landing/
│   │   │   ├── DemoSection.tsx         # 3 interactive example analyses
│   │   │   ├── HeroAnimation.tsx       # Hero section animation (framer-motion)
│   │   │   └── RentCalculator.tsx      # Rent limit calculator widget
│   │   ├── payment/
│   │   │   ├── PricingCards.tsx        # Plan selection UI
│   │   │   └── CheckoutButton.tsx      # Triggers Stripe Checkout via useCheckout
│   │   └── CookieBanner.tsx            # GDPR cookie consent (global, rendered in App)
│   ├── pages/
│   │   ├── Landing.tsx                 # Marketing page with interactive demo
│   │   ├── Pricing.tsx                 # Pricing page
│   │   ├── Login.tsx                   # Auth (email + Google)
│   │   ├── Dashboard.tsx               # Main app: upload + analyze
│   │   ├── Analysis.tsx                # Results page (by analysis ID)
│   │   ├── History.tsx                 # Past analyses list
│   │   ├── PaymentSuccess.tsx          # Stripe redirect after successful payment
│   │   ├── PaymentCancel.tsx           # Stripe redirect after cancelled payment
│   │   ├── Privacy.tsx                 # Privacy policy
│   │   ├── Terms.tsx                   # Terms of service
│   │   └── NotFound.tsx                # 404
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client singleton
│   │   ├── stripe.ts                   # Stripe.js init
│   │   └── utils.ts                    # cn() + shared helpers
│   ├── store/
│   │   └── useAppStore.ts              # ⚠️ SINGLE FILE — both useAuthStore + useUploadStore
│   ├── queries/
│   │   ├── keys.ts                     # TanStack Query key factory
│   │   ├── analyses.ts                 # useAnalyses, useAnalysis hooks
│   │   └── profile.ts                  # useProfile, useCredits hooks
│   ├── hooks/
│   │   ├── useAnalyzeContract.ts       # Mutation: upload PDF → call Edge Function
│   │   ├── useAuth.ts                  # signIn / signUp / signInWithGoogle / signOut
│   │   ├── useCheckout.ts              # Calls create-checkout-session → redirects to Stripe
│   │   ├── useContractChat.ts          # Chat state + contract-chat Edge Function (10 msg limit)
│   │   └── useCountUp.ts              # Animated counter via framer-motion (respects prefers-reduced-motion)
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces and types
│   ├── schemas/
│   │   └── index.ts                    # Zod schemas (shared validation)
│   ├── i18n/
│   │   └── index.ts                    # i18next config
│   ├── App.tsx                         # React Router v7 routes + AnimatePresence + RequireAuth guard
│   ├── main.tsx                        # Entry point + providers
│   └── index.css                       # Tailwind v4 @import directives
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   └── 002_analyses.sql
│   └── functions/
│       ├── analyze-contract/
│       │   ├── index.ts                # Claude API proxy + credit check
│       │   └── ley-context.md          # ⚠️ LEGAL CONTEXT — update when laws change
│       ├── contract-chat/
│       │   └── index.ts                # Claude chat about a specific analysis (reads result_json from DB)
│       ├── create-checkout-session/
│       │   └── index.ts                # Creates Stripe Checkout session → returns URL
│       └── stripe-webhook/
│           └── index.ts                # Handles checkout.session.completed etc.
├── .env.example
├── .env.local                          # gitignored
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts                      # @tailwindcss/vite plugin + @ alias
└── CLAUDE.md
```

---

## State Management Architecture

**Rule: never mix server state and client state.**

### TanStack Query — server state (data that lives in Supabase)
```typescript
// src/queries/analyses.ts
export const analysisKeys = {
  all: ['analyses'] as const,
  list: () => [...analysisKeys.all, 'list'] as const,
  detail: (id: string) => [...analysisKeys.all, 'detail', id] as const,
}

export function useAnalyses() {
  return useQuery({
    queryKey: analysisKeys.list(),
    queryFn: () => supabase.from('analyses').select('*').order('created_at', { ascending: false }),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
```

### Zustand — client state (UI state, not persisted)

⚠️ **Both stores live in a single file: `src/store/useAppStore.ts`** — do not split them.

```typescript
// src/store/useAppStore.ts  (abbreviated)

// Auth store — includes initialize() which sets up onAuthStateChange listener
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,      // full Supabase Session (has access_token for Edge Function calls)
  profile: Profile | null,
  isLoading: true,
  initialize: async () => { /* calls supabase.auth.getSession() + onAuthStateChange */ },
  reset: () => set({ user: null, session: null, profile: null, isLoading: false }),
}))

// Upload store
type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'
export const useUploadStore = create<UploadStore>((set) => ({
  file: null,
  status: 'idle',
  progress: 0,
  errorMessage: null,
  // setFile / setStatus / setProgress / setError / reset
}))
```

### Context — only for auth (Supabase handles it, wrap once)
Auth state comes from Supabase Auth and is exposed via `useAuthStore` (Zustand). Do not create a separate AuthContext.

---

## Environment Variables

```bash
# .env.example — copy to .env.local and fill in

# Supabase (safe for frontend)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe (publishable key only — safe for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from Stripe Dashboard)
VITE_STRIPE_PRICE_SINGLE=price_...
VITE_STRIPE_PRICE_PACK=price_...
VITE_STRIPE_PRICE_PRO=price_...

# Sentry (public DSN — safe for frontend)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# App URL
VITE_APP_URL=http://localhost:5173
```

**Supabase Edge Function secrets — set via Supabase Dashboard → Edge Functions → Secrets:**
```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Database Schema

### profiles
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  plan text not null default 'none',            -- none | single | pack | pro
  credits_remaining integer not null default 0,
  credits_expiry timestamptz,                   -- for pack plan (90 days)
  stripe_customer_id text,
  stripe_subscription_id text,                  -- for pro plan
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### analyses
```sql
create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  filename text not null,
  puntuacion text not null,                     -- buena | aceptable | mala | error
  result_json jsonb not null,                   -- full Claude API response
  law_version text not null,                    -- from ley-context.md last_updated
  created_at timestamptz default now()
);

alter table analyses enable row level security;

create policy "users can read own analyses"
  on analyses for select using (auth.uid() = user_id);

create policy "edge function can insert analyses"
  on analyses for insert with check (true);  -- controlled by service role in Edge Function
```

---

## Key Architecture Rules

### CRITICAL: API Security
- `ANTHROPIC_API_KEY` lives ONLY in Supabase Edge Function secrets
- It NEVER appears in frontend code, NEVER in `VITE_` variables
- Every call to Claude goes through `supabase/functions/analyze-contract/`
- The Edge Function verifies auth token + checks credits BEFORE calling Claude

### Payment Flow
1. User selects plan → `CheckoutButton` creates Stripe Checkout session via Edge Function or direct API
2. Stripe redirects to `VITE_APP_URL/payment/success?session_id=xxx`
3. Stripe sends `checkout.session.completed` webhook to `stripe-webhook` Edge Function
4. Webhook updates `profiles.plan`, `profiles.credits_remaining`, `profiles.credits_expiry`
5. Frontend invalidates TanStack Query `profile` cache → UI updates instantly

### Credit System
- `single` purchase → `credits_remaining = 1`
- `pack` purchase → `credits_remaining = 3`, `credits_expiry = now() + 90 days`
- `pro` subscription → skip credit check entirely (check `plan === 'pro'`)
- Edge Function decrements credits atomically using Postgres transaction
- If credits expired (pack plan), treat as `none`

### Analysis Flow
1. User drops PDF on `UploadZone` → stored in Zustand `uploadStore`
2. `useAnalyzeContract` mutation: converts PDF to base64 → calls `analyze-contract` Edge Function
3. Edge Function: verifies JWT → checks credits → reads `ley-context.md` → calls Claude API → saves to DB → returns result + decrements credits
4. On success: invalidate `analysisKeys.list()` → navigate to `/analysis/:id`
5. `Analysis` page fetches result from DB via TanStack Query

---

## TypeScript Types

```typescript
// src/types/index.ts

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
```

---

## Zod Schemas

```typescript
// src/schemas/index.ts
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

// Always validate Claude API response with this schema before saving to DB
```

---

## Supabase Email Template — Password Reset

⚠️ **Admin action required after deploy:** Update the Supabase password reset email template to match the brand.

**Where:** Supabase Dashboard → Authentication → Email Templates → Reset Password

**Recommended Spanish template:**
```html
<h2>Restablecer tu contraseña — ClausulaAI</h2>
<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
<p>Haz clic en el enlace de abajo para elegir una nueva contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
<p>Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.</p>
<p>— El equipo de ClausulaAI</p>
```

The `redirectTo` in `supabase.auth.resetPasswordForEmail()` is set to `VITE_APP_URL/reset-password`. Supabase appends the recovery token as a URL hash fragment — the `/reset-password` page processes it automatically via the Supabase client.

---

## Legal Update Strategy

### How it works
`supabase/functions/analyze-contract/index.ts` reads `ley-context.md` at runtime and injects it into every Claude system prompt. The `last_updated` frontmatter field is extracted and included in the JSON response → shown in UI as "Análisis actualizado a [date]".

### ley-context.md format
```markdown
---
last_updated: marzo 2026
version: 1.3
---

# Normativa LAU vigente — [month year]

[legal content]
```

### When to update ley-context.md
- New Real Decreto-Ley affecting housing published in BOE
- INE publishes new annual rent reference index (every January)
- New zonas tensionadas declared by a Comunidad Autónoma
- Any modification to Ley 29/1994 or Ley 12/2023

### Current content (March 2026)

```markdown
---
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
- El desahucio requiere siempre proceso judicial
```

---

## Claude API Prompt (Edge Function)

```typescript
// supabase/functions/analyze-contract/index.ts

const leyContext = await Deno.readTextFile(
  new URL('./ley-context.md', import.meta.url)
)

const lastUpdatedMatch = leyContext.match(/last_updated:\s*(.+)/)
const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : 'fecha desconocida'

const SYSTEM_PROMPT = `Eres un experto en derecho arrendaticio español.
Analizas contratos de alquiler de vivienda habitual en España.
Respondes SOLO con JSON válido, sin texto adicional ni backticks markdown.

Normativa LAU vigente que DEBES aplicar:

${leyContext}`

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

Si el contrato contiene cláusulas inusuales, poco comunes o no listadas anteriormente que potencialmente
infrinjan la LAU, vulneren derechos del inquilino o sean desproporcionadamente favorables al arrendador,
inclúyelas también en el análisis. No te limites a las cláusulas listadas — analiza todo el contrato.

Si el PDF no contiene texto extraíble (parece ser una imagen escaneada), devuelve exactamente este JSON de error:
{
  "puntuacion": "error",
  "last_updated": "${lastUpdated}",
  "clausulas": [],
  "recomendacion": "El documento parece ser una imagen escaneada y no contiene texto extraíble. Por favor, usa un PDF con texto seleccionable o solicita al arrendador una versión digital del contrato."
}`
```

---

## Features Built Since v1.0.0

### ContractChat
After viewing an analysis, users can ask follow-up questions about their specific contract. Implemented as a collapsible widget at the bottom of the Analysis page.

- **Limit:** 10 messages per analysis (client + server enforced). After limit: show amber message, no more sends.
- **Edge Function:** `contract-chat/index.ts` — receives `analysis_id`, `message`, `conversation_history[]`. Reads the `result_json` from DB to ground Claude's answers. Returns `{ response: string }`.
- **Hook:** `useContractChat` — manages `messages: ChatMessage[]`, `isLoading`, `error`, `limitReached`. On error: removes the failed user message from state.
- **Component:** `ContractChat.tsx` — collapsible, shows suggested questions when empty, typing dots animation, timestamps.

### PDF Export
Users can download their analysis as a formatted PDF from the Analysis page.

- **Library:** `@react-pdf/renderer` v4 (renders entirely in-browser, no server needed)
- **Component:** `AnalysisPDFReport.tsx` — receives `Analysis` type, renders branded PDF with score, clauses, recommendation, and law update date.

### RentCalculator
An interactive widget on the landing page that lets users estimate legal rent limits for their zone. Conversion tool to demonstrate product value before payment.

### Page Transitions
`App.tsx` wraps all routes in `<AnimatePresence>` from framer-motion. Each route fades + slides in (opacity 0→1, y 8→0, 0.18s). Respects `prefers-reduced-motion` via `useReducedMotion()`.

### CookieBanner
GDPR-compliant cookie consent. Rendered globally in `App.tsx` outside the route tree.

---

## Landing Page — Demo Section

The landing must show 3 interactive example analyses before any paywall. This is the primary conversion mechanism.

**Three scenarios:**
1. Contrato correcto → green score, "Puedes firmarlo con tranquilidad"
2. Cláusulas abusivas → amber score, negotiation advice per clause
3. Contrato ilegal → red score, "Las cláusulas ilegales son nulas aunque hayas firmado"

**Key conversion messages:**
- "Las cláusulas ilegales son nulas aunque las hayas firmado" — hooks past signers
- "Actualizado a [month year]" — trust signal vs static legal sites
- Expandable clause cards with action per clause — shows value before paying
- CTA: "Analizar mi contrato — desde 3,99€"

---

## Code Conventions

- **Language:** All code in English. All UI text via i18next keys. Never hardcode Spanish strings in components.
- **Components:** Functional only. No class components. No `forwardRef` (React 19 — pass ref as prop directly).
- **Styling:** Tailwind v4 utilities only. No inline styles. No CSS modules.
- **State:** TanStack Query for server state. Zustand for client state. Never use Context for data.
- **Forms:** React Hook Form + Zod always. Never uncontrolled forms or manual validation.
- **Async:** async/await always. No `.then()` chains.
- **Errors:** Always handle explicitly. Show user-friendly messages. Log to Sentry in production.
- **Types:** Zero `any`. Explicit types everywhere. Use Zod schemas to validate API responses.
- **Imports:** Absolute via `@/` alias. Group: external → internal → types → styles.
- **Files:** One component per file. PascalCase filenames = component name.
- **Testing:** Every utility function in `src/lib/` needs a Vitest unit test.
- **Mobile-first:** Design at 375px first, then scale up with Tailwind breakpoints.

---

## Development Commands

```bash
npm run dev              # Dev server at localhost:5173
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint
npm run test             # Vitest
npm run test:ui          # Vitest UI
npx supabase start       # Local Supabase (requires Docker)
npx supabase db push     # Push migrations to remote
npx supabase functions serve  # Serve Edge Functions locally
```

---

## Pending Manual Steps (Supabase Dashboard)

### Migrations — run in Supabase Dashboard → SQL Editor
When Contract Monitor feature is built, apply:
- `supabase/migrations/004_contracts.sql` — active contracts table for monitor
- `supabase/migrations/005_organization.sql` — organization/branding settings table

### Storage bucket
Create the `logos` bucket: Supabase Dashboard → Storage → New bucket → Name: `logos` → Public: true

### Connection pooling
Enable PgBouncer: Supabase Dashboard → Settings → Database → Connection pooling → Enable

---

## Tailwind v4 Setup Notes

Tailwind v4 has NO `tailwind.config.ts`. Configuration is in CSS:

```css
/* src/index.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-brand: #1a1a2e;
  --font-sans: 'Inter Variable', sans-serif;
}
```

vite.config.ts uses `@tailwindcss/vite` plugin, NOT PostCSS:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
})
```

---

## Current Status

- [x] CLAUDE.md created
- [x] npm create vite@latest + install dependencies
- [x] shadcn/ui init
- [x] Supabase project configured + migrations applied
- [x] Stripe products created (single, pack, pro)
- [x] Auth flow (email + Google)
- [x] Edge Function: analyze-contract
- [x] Edge Function: stripe-webhook
- [x] Edge Function: contract-chat
- [x] Edge Function: create-checkout-session
- [x] Landing page with demo section + RentCalculator
- [x] Dashboard + upload flow
- [x] Payment flow end-to-end (PaymentSuccess + PaymentCancel pages)
- [x] ContractChat feature
- [x] PDF export (AnalysisPDFReport)
- [x] Privacy + Terms pages
- [x] Cookie consent banner
- [x] Page transitions (framer-motion)
- [x] PublicLayout + AppLayout unified header/footer system
- [x] Premium design system (Playfair Display + Inter + gold accent #c9a96e)
- [x] Transparent navbar on hero, solid on scroll
- [x] Subtle background patterns on app pages
- [x] Login split layout (dark left panel + form right panel)
- [x] Legal letter generator (generate-letter Edge Function + Letters.tsx page)
- [x] Retry logic on Claude API calls (callClaudeWithRetry in analyze-contract + generate-letter)
- [x] Rent update calculator (RentUpdateCalculator component + /calculadora route)
- [x] Legal Chat — Edge Function legal-chat + /consulta page + useLegalChat hook (5 free questions, Pro unlimited)
- [ ] Connection pooling enabled in Supabase dashboard (manual step — Dashboard → Settings → Database → Connection pooling / PgBouncer)
- [ ] Stripe live mode configured
- [ ] clausulaai.es domain connected to Vercel
- [ ] Cloudflare DNS propagated

---

## Important Notes for Claude CLI

- Read this entire file before starting any task
- `ley-context.md` is the ONLY place where legal rules live — never hardcode law into prompts
- Always validate Claude API responses with `analysisResultSchema` from `src/schemas/index.ts` before saving
- Always show `result_json.last_updated` in the UI — it's a core trust feature
- `ANTHROPIC_API_KEY` NEVER in frontend code
- Use `@/` imports always, never relative paths except within the same folder
- Zustand stores live in `src/store/useAppStore.ts` (single file, not `src/stores/`) — import from `@/store/useAppStore`
- When adding new Zustand stores, add them to `useAppStore.ts`, do not create new store files
- When creating TanStack Query hooks, always define `staleTime` explicitly
- Mobile-first always: build for 375px width, then add `md:` and `lg:` breakpoints

---

## Product Roadmap

### Phase 1 — Months 1-3 (Current focus)
**Target:** 200 paying users + 5 B2B gestorías + 1.500€/month MRR

**Features to build:**

1. **Legal letter generator (cartas legales)** — HIGH PRIORITY
   - Carta de reclamación de impago (Art. 27 LAU)
   - Carta de actualización de renta con índice INE
   - Carta de preaviso de no renovación (4 months notice)
   - Carta de devolución de fianza (30 days)
   - New page: `/cartas` | New Edge Function: `generate-letter`
   - Available for Pro plan and above
   - PDF download with ClausulaAI branding

2. **Rent update calculator (calculadora actualización renta)**
   - Free tool on landing page for SEO traffic
   - Input: current rent + contract date
   - Output: maximum legal increase % based on INE index
   - Auto-generates the carta de actualización
   - New section on `Landing.tsx` + new route `/calculadora`

3. **Stripe live mode**
   - Switch from test to live keys
   - Verify Stripe account (Mario needs to complete business verification)

4. **SEO Blog**
   - `/blog` route
   - 5 initial articles about LAU, illegal clauses, zonas tensionadas

### Phase 2 — Months 4-8
**Target:** 30 B2B gestorías + 8.000€/month MRR

**Features to build:**
1. Active contract monitor — gestorías upload all active contracts, ClausulaAI monitors and alerts
2. Multi-user workspaces with roles (admin/agent)
3. White-label PDF with gestoría logo
4. Contract generator (generador de contratos LAU)
5. General legal chat (not contract-specific)
6. Public API for Rentger/Homming integration

### Phase 3 — Months 9-14
**Target:** 100+ gestorías + 25.000€/month MRR

**Features to build:**
1. BOE automatic monitor (pg_cron + RSS)
2. Zona tensionada detector by address
3. Contratos de trabajo analysis (second document category)
4. Annual alerts (email when contract turns 1 year old)
5. Analytics dashboard for gestorías

### Phase 4 — Months 15-24
**Target:** Acquisition or investment round + 5-10M€ valuation

**Features to build:**
1. Official integration with Rentger/Homming
2. Digital signature integration (Signaturit)
3. Native iOS/Android app (Expo)
4. International expansion (Portugal first)
5. Proprietary scoring model from 50k+ analyzed contracts

### Target Acquirers
- **Primary:** Rentger (backed by Idealista), Homming
- **Secondary:** Fotocasa, Idealista (portal integration)
- **Tertiary:** Legal tech firms, proptech investment funds

### Pricing Strategy
- **B2C:** 3.99€ (single), 9.99€ (pack 3), 19€/month (Pro)
- **B2B Phase 1:** 29€/month (Starter gestoría), 59€/month (Pro gestoría)
- **B2B Phase 2:** 99€/month (Despacho), custom enterprise pricing
