function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Header */}
          <div className="mb-10 border-b border-gray-200 pb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">Legal</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Política de Privacidad</h1>
            <p className="mt-2 text-sm text-gray-500">
              Última actualización: marzo 2026 · Responsable: ClausulaAI (hola@clausulaai.es)
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            <Section title="1. Responsable del tratamiento">
              <p>
                El responsable del tratamiento de tus datos personales es <strong>ClausulaAI</strong>,
                con dirección de contacto en{' '}
                <a href="mailto:hola@clausulaai.es" className="font-medium text-indigo-600 hover:underline">hola@clausulaai.es</a>.
              </p>
            </Section>

            <Section title="2. Qué datos recogemos">
              <p>Recogemos los siguientes datos:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Datos de registro:</strong> dirección de correo electrónico y contraseña (almacenada cifrada).</li>
                <li><strong>Datos de uso:</strong> contratos PDF que subes para análisis, resultados del análisis y metadatos de uso (fecha, nombre del archivo).</li>
                <li><strong>Datos de pago:</strong> procesados íntegramente por Stripe. ClausulaAI no almacena datos de tarjeta.</li>
                <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas y tiempos de sesión mediante cookies de análisis.</li>
              </ul>
            </Section>

            <Section title="3. Para qué usamos tus datos">
              <ul className="ml-4 list-disc space-y-1">
                <li>Prestarte el servicio de análisis de contratos de alquiler.</li>
                <li>Gestionar tu cuenta y el historial de análisis.</li>
                <li>Procesar tus pagos a través de Stripe.</li>
                <li>Mejorar la calidad del servicio mediante análisis estadístico agregado y anónimo.</li>
                <li>Enviarte comunicaciones de servicio (confirmación de cuenta, recibos de pago). No realizamos marketing sin consentimiento explícito.</li>
              </ul>
            </Section>

            <Section title="4. Base jurídica del tratamiento">
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Ejecución del contrato</strong> (Art. 6.1.b RGPD): datos necesarios para prestarte el servicio.</li>
                <li><strong>Interés legítimo</strong> (Art. 6.1.f RGPD): análisis de uso agregado para mejorar el servicio.</li>
                <li><strong>Consentimiento</strong> (Art. 6.1.a RGPD): cookies no esenciales, si las aceptas.</li>
              </ul>
            </Section>

            <Section title="5. Cuánto tiempo conservamos tus datos">
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Datos de cuenta y análisis:</strong> mientras tu cuenta esté activa. Si la eliminas, tus datos se borran en un plazo máximo de 30 días.</li>
                <li><strong>PDFs analizados:</strong> no se almacenan en nuestros servidores una vez completado el análisis. El resultado JSON sí se guarda en tu historial.</li>
                <li><strong>Datos de pago:</strong> Stripe los retiene conforme a su política, habitualmente 7 años por obligaciones fiscales.</li>
                <li><strong>Logs técnicos:</strong> máximo 90 días.</li>
              </ul>
            </Section>

            <Section title="6. Compartición de datos con terceros">
              <p>Tus datos pueden ser compartidos con los siguientes proveedores de confianza:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Supabase</strong> (base de datos y autenticación) — UE / EE. UU. con cláusulas contractuales estándar.</li>
                <li><strong>Stripe</strong> (pagos) — EE. UU. con Privacy Shield / SCCs.</li>
                <li><strong>Anthropic</strong> (análisis con IA) — EE. UU. con SCCs. Los PDFs se envían cifrados y no se usan para entrenar modelos.</li>
                <li><strong>Sentry</strong> (monitoreo de errores) — EE. UU. con SCCs.</li>
              </ul>
              <p>No vendemos tus datos a terceros ni los usamos para publicidad.</p>
            </Section>

            <Section title="7. Tus derechos (RGPD)">
              <p>Como usuario en la UE tienes los siguientes derechos:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Acceso:</strong> solicitar qué datos tenemos sobre ti.</li>
                <li><strong>Rectificación:</strong> corregir datos incorrectos.</li>
                <li><strong>Supresión («derecho al olvido»):</strong> eliminar tu cuenta y todos tus datos.</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado (JSON).</li>
                <li><strong>Oposición y limitación:</strong> limitar el tratamiento en determinadas circunstancias.</li>
                <li><strong>Retirada del consentimiento:</strong> para cookies no esenciales, en cualquier momento.</li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos escríbenos a{' '}
                <a href="mailto:hola@clausulaai.es" className="font-medium text-indigo-600 hover:underline">
                  hola@clausulaai.es
                </a>
                . Responderemos en un plazo máximo de 30 días. También puedes reclamar ante la{' '}
                <strong>Agencia Española de Protección de Datos (AEPD)</strong> en aepd.es.
              </p>
            </Section>

            <Section title="8. Cookies">
              <p>Usamos los siguientes tipos de cookies:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li><strong>Esenciales:</strong> necesarias para el funcionamiento del servicio (sesión, autenticación). No requieren consentimiento.</li>
                <li><strong>Analíticas:</strong> para entender cómo se usa el servicio (Sentry). Solo se activan con tu consentimiento.</li>
              </ul>
              <p>Puedes gestionar tus preferencias de cookies en cualquier momento desde el banner de cookies o borrándolas desde la configuración de tu navegador.</p>
            </Section>

            <Section title="9. Seguridad">
              <p>
                Usamos cifrado TLS en todas las comunicaciones, autenticación con JWT firmados y control de acceso por fila (RLS) en la base de datos.
                Los PDFs se transmiten cifrados y no se almacenan después del análisis.
              </p>
            </Section>

            <Section title="10. Contacto">
              <p>
                Para cualquier consulta sobre privacidad contacta con nosotros en{' '}
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
