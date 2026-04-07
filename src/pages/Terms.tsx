function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  )
}

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Header */}
          <div className="mb-10 border-b border-gray-200 pb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">Legal</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Términos y Condiciones</h1>
            <p className="mt-2 text-sm text-gray-500">
              Última actualización: marzo 2026 · Contacto:{' '}
              <a href="mailto:hola@clausulaai.es" className="font-medium text-indigo-600 hover:underline">hola@clausulaai.es</a>
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            {/* Disclaimer destacado */}
            <div className="mb-8 rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
              <div className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-800">Aviso legal importante</p>
                  <p className="mt-1 text-sm text-amber-700">
                    ClausulaAI proporciona <strong>información legal orientativa</strong>, no asesoramiento jurídico profesional.
                    El análisis generado por inteligencia artificial <strong>no sustituye la consulta con un abogado colegiado</strong>.
                    Para decisiones legales con consecuencias económicas significativas, consulta siempre con un profesional.
                  </p>
                </div>
              </div>
            </div>

            <Section title="1. Descripción del servicio">
              <p>
                ClausulaAI es una aplicación web que analiza contratos de arrendamiento de vivienda habitual en España
                mediante inteligencia artificial (Claude de Anthropic). El servicio identifica cláusulas potencialmente
                ilegales, abusivas o desfavorables según la normativa LAU vigente y proporciona información orientativa
                al usuario.
              </p>
              <p>
                Para acceder al servicio es necesario crear una cuenta y adquirir créditos de análisis o suscribirse
                al plan Pro. El servicio está dirigido exclusivamente a particulares y profesionales mayores de 18 años
                con residencia en España.
              </p>
            </Section>

            <Section title="2. Registro y cuenta">
              <p>
                Para usar el servicio debes registrarte con una dirección de correo electrónico válida. Eres responsable
                de mantener la confidencialidad de tus credenciales y de toda actividad que ocurra bajo tu cuenta.
                Debes notificarnos inmediatamente de cualquier uso no autorizado.
              </p>
            </Section>

            <Section title="3. Precios y pagos">
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>1 análisis:</strong> 3,99 € (pago único).</li>
                <li><strong>Pack 3 análisis:</strong> 9,99 € (pago único, válido 90 días desde la compra).</li>
                <li><strong>Plan Pro:</strong> 19 €/mes (suscripción mensual, análisis ilimitados).</li>
              </ul>
              <p>
                Todos los precios incluyen el IVA aplicable. Los pagos se procesan de forma segura a través de Stripe.
                Los créditos del pack de 3 análisis caducan 90 días después de la compra y no son reembolsables
                una vez utilizados.
              </p>
              <p>
                Las suscripciones Pro se renuevan automáticamente cada mes. Puedes cancelar en cualquier momento
                desde tu cuenta; la cancelación será efectiva al final del período de facturación en curso.
              </p>
            </Section>

            <Section title="4. Política de reembolso">
              <p>
                Dado que el servicio se presta de forma inmediata (el análisis se realiza en el momento del pago),
                los créditos utilizados no son reembolsables. Si experimentas un error técnico que impida la correcta
                prestación del servicio, contacta con nosotros en{' '}
                <a href="mailto:hola@clausulaai.es" className="font-medium text-indigo-600 hover:underline">hola@clausulaai.es</a>{' '}y
                evaluaremos cada caso individualmente.
              </p>
            </Section>

            <Section title="5. Uso aceptable">
              <p>El usuario se compromete a:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Usar el servicio únicamente para analizar contratos de arrendamiento de vivienda habitual en España.</li>
                <li>No subir documentos que no sean contratos de arrendamiento (datos personales sensibles ajenos, contenido ilegal, etc.).</li>
                <li>No intentar eludir los límites de crédito o realizar ingeniería inversa del servicio.</li>
                <li>No compartir el acceso a su cuenta con terceros.</li>
                <li>No usar el servicio de forma masiva o automatizada sin autorización expresa.</li>
              </ul>
            </Section>

            <Section title="6. Limitación de responsabilidad">
              <p>
                ClausulaAI pone el máximo cuidado en la calidad del análisis, pero <strong>no garantiza</strong> que
                el resultado sea completo, exacto o actualizado en todo momento. La legislación en materia de
                arrendamientos urbanos puede cambiar, y pueden existir normativas autonómicas que el servicio
                no contemple en todos los casos.
              </p>
              <p>
                En la máxima medida permitida por la ley, ClausulaAI <strong>no será responsable</strong> de daños
                directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de usar
                el servicio, incluyendo decisiones tomadas basándose en el análisis generado.
              </p>
              <p>
                La responsabilidad máxima de ClausulaAI se limita al importe pagado por el usuario en los
                6 meses anteriores al evento que origine la reclamación.
              </p>
            </Section>

            <Section title="7. Propiedad intelectual">
              <p>
                El software, diseño y contenidos de ClausulaAI son propiedad de ClausulaAI o de sus licenciantes
                y están protegidos por la legislación de propiedad intelectual. Los análisis generados son
                propiedad del usuario que los encargó.
              </p>
            </Section>

            <Section title="8. Modificaciones del servicio">
              <p>
                Nos reservamos el derecho de modificar, suspender o interrumpir el servicio en cualquier momento,
                con o sin previo aviso. También podemos actualizar estos términos; si los cambios son materiales,
                te lo notificaremos por correo electrónico con al menos 15 días de antelación.
              </p>
            </Section>

            <Section title="9. Ley aplicable y jurisdicción">
              <p>
                Estos términos se rigen por la ley española. Para cualquier controversia, las partes se someten
                a los Juzgados y Tribunales de la ciudad de Barcelona, salvo que la legislación de consumidores
                aplicable establezca otro fuero.
              </p>
            </Section>

            <Section title="10. Contacto">
              <p>
                Para cualquier consulta sobre estos términos escríbenos a{' '}
                <a href="mailto:hola@clausulaai.es" className="font-medium text-indigo-600 hover:underline">
                  hola@clausulaai.es
                </a>
                .
              </p>
            </Section>

          </div>
        </div>
  )
}
