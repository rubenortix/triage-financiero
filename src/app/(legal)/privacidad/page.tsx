export const metadata = {
  title: "Política de Privacidad",
  description: "Cómo Triage Financiero trata tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 30 de abril de 2026
        </p>
      </header>

      <Section title="1. Quién es el responsable">
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <strong>Triage Financiero LLC</strong> (“Triage”, “nosotros”), con
          domicilio en Estados Unidos. Para preguntas sobre privacidad o
          ejercer tus derechos, escríbenos a{" "}
          <a href="mailto:privacidad@triagefinanciero.com">
            privacidad@triagefinanciero.com
          </a>
          .
        </p>
      </Section>

      <Section title="2. Qué datos recolectamos">
        <p>Cuando usas Triage, podemos recolectar:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Datos de cuenta</strong>: email, nombre (si lo provees),
            país, etapa de carrera profesional.
          </li>
          <li>
            <strong>Respuestas al diagnóstico</strong>: las opciones que eliges
            en las 10 preguntas, el arquetipo asignado, y el score resultante.
          </li>
          <li>
            <strong>Datos de uso</strong>: páginas visitadas, eventos
            (diagnósticos completados, simulaciones, generaciones de plan),
            timestamps, dispositivo y navegador.
          </li>
          <li>
            <strong>Conversaciones con el asistente IA</strong>: si las
            utilizas, almacenamos los mensajes para mejorar el servicio y
            cumplir requisitos legales.
          </li>
          <li>
            <strong>Datos de pago</strong>: si te suscribes a un plan,
            procesamos los pagos a través de Stripe. NO almacenamos los datos
            de tu tarjeta — Stripe es el responsable del tratamiento de esos
            datos.
          </li>
        </ul>
        <p>
          <strong>NO solicitamos información sobre tus pacientes ni datos
          clínicos.</strong> Triage es para tus finanzas personales, no para
          tu práctica médica.
        </p>
      </Section>

      <Section title="3. Cómo usamos tus datos">
        <p>Usamos tus datos para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Prestar y mejorar el servicio (diagnóstico, plan, simuladores)</li>
          <li>
            Personalizar el contenido (interpretaciones IA según tu arquetipo y
            país)
          </li>
          <li>
            Enviarte comunicaciones operacionales (confirmaciones, recordatorios
            de re-diagnóstico, cambios al servicio)
          </li>
          <li>
            Enviarte newsletter o material educativo si te suscribes
            explícitamente (puedes cancelar en cualquier momento)
          </li>
          <li>Procesar pagos y prevenir fraude</li>
          <li>Cumplir obligaciones legales y resolver disputas</li>
          <li>
            Análisis agregado y anónimo para mejorar el producto (ej. distribución
            de arquetipos por país)
          </li>
        </ul>
      </Section>

      <Section title="4. Procesadores que usamos">
        <p>
          Para prestar el servicio compartimos datos con procesadores
          confiables, todos sujetos a acuerdos de tratamiento de datos:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Supabase</strong> (Estados Unidos) — base de datos, autenticación, almacenamiento
          </li>
          <li>
            <strong>Vercel</strong> (Estados Unidos) — hosting y entrega de la aplicación web
          </li>
          <li>
            <strong>Anthropic</strong> (Estados Unidos) — procesamiento de IA
            (modelos Claude). Tus respuestas y arquetipo se envían a Anthropic
            para generar interpretaciones, planes y respuestas conversacionales.
            Anthropic no entrena sus modelos con tus datos según su política de
            API.
          </li>
          <li>
            <strong>Stripe</strong> (Estados Unidos) — procesamiento de pagos
          </li>
          <li>
            <strong>Resend</strong> (Estados Unidos) — envío de emails transaccionales
          </li>
          <li>
            <strong>PostHog</strong> (Estados Unidos) — analítica de producto
            (cuando esté activo)
          </li>
        </ul>
      </Section>

      <Section title="5. Transferencia internacional de datos">
        <p>
          Por la naturaleza de los servicios cloud que usamos, tus datos pueden
          ser tratados en Estados Unidos y otros países. Estas transferencias
          se realizan con salvaguardas contractuales (cláusulas estándar de
          protección de datos cuando aplica) para asegurar un nivel adecuado
          de protección.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>
          Dependiendo de tu país de residencia (Colombia, México, Argentina,
          Chile, Perú, Ecuador, Uruguay, España, otros), tienes derecho a:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Acceder</strong> a los datos personales que tenemos sobre ti
          </li>
          <li>
            <strong>Rectificar</strong> datos inexactos
          </li>
          <li>
            <strong>Suprimir</strong> tus datos (“derecho al olvido”)
          </li>
          <li>
            <strong>Oponerte</strong> a determinados tratamientos
          </li>
          <li>
            <strong>Limitar</strong> el tratamiento en ciertas circunstancias
          </li>
          <li>
            <strong>Portar</strong> tus datos a otro proveedor en formato
            estructurado
          </li>
          <li>
            <strong>Revocar consentimiento</strong> en cualquier momento (no
            afecta a tratamientos previos lícitos)
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a href="mailto:privacidad@triagefinanciero.com">
            privacidad@triagefinanciero.com
          </a>
          . Responderemos en un plazo máximo de 30 días.
        </p>
      </Section>

      <Section title="7. Conservación de datos">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa, más un período
          razonable después del cierre para cumplir obligaciones legales,
          fiscales y de defensa ante reclamos (típicamente 5-7 años desde el
          cierre). Los datos analíticos agregados anónimos pueden conservarse
          indefinidamente.
        </p>
      </Section>

      <Section title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger
          tus datos: cifrado en tránsito (HTTPS) y en reposo, autenticación
          mediante magic link sin contraseñas guardadas, control de acceso por
          fila (Row Level Security) en la base de datos, y registros de
          actividad. Ningún sistema es 100% seguro; te notificaremos cualquier
          incidente que afecte tus datos personales en los plazos que exija la
          ley aplicable.
        </p>
      </Section>

      <Section title="9. Cookies y tecnologías similares">
        <p>
          Usamos cookies estrictamente necesarias para mantener tu sesión
          autenticada. Si activamos analítica, usaremos cookies de medición
          agregada (sin identificar a usuarios individualmente cuando sea
          posible). Puedes configurar tu navegador para rechazar cookies, pero
          algunas funciones podrían dejar de operar correctamente.
        </p>
      </Section>

      <Section title="10. Menores">
        <p>
          Triage está dirigido a profesionales adultos. No solicitamos ni
          tratamos a sabiendas datos de menores de 18 años. Si crees que
          hemos recolectado datos de un menor, contáctanos y los eliminaremos.
        </p>
      </Section>

      <Section title="11. Cambios a esta política">
        <p>
          Si modificamos esta política de manera material, te avisaremos por
          email y publicaremos la versión nueva con su fecha de actualización.
          Si los cambios afectan derechos sustanciales, te pediremos
          re-confirmación de aceptación.
        </p>
      </Section>

      <Section title="12. Cumplimiento por jurisdicción">
        <p>Esta política intenta cumplir, entre otras:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ley 1581 de 2012 (Habeas Data) en Colombia</li>
          <li>LFPDPPP en México</li>
          <li>LGPD en Brasil</li>
          <li>Ley 25.326 en Argentina</li>
          <li>LOPDGDD y RGPD/GDPR en España</li>
          <li>CCPA en California, EE.UU.</li>
        </ul>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold mt-6">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/90 space-y-3">
        {children}
      </div>
    </section>
  );
}
