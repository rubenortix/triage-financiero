export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos de uso de Triage Financiero.",
};

export default function TerminosPage() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 30 de abril de 2026
        </p>
      </header>

      <Section title="1. Quiénes somos">
        <p>
          Triage Financiero (en adelante, “Triage”) es un servicio operado por
          la sociedad <strong>Triage Financiero LLC</strong>, registrada en
          Estados Unidos. Brindamos análisis educativo de finanzas personales
          mediante un cuestionario, un diagnóstico patrimonial y herramientas
          de simulación asistidas por inteligencia artificial.
        </p>
      </Section>

      <Section title="2. Aceptación de estos términos">
        <p>
          Al crear una cuenta, completar el diagnóstico, o usar cualquier
          funcionalidad de Triage, aceptas estos términos en su totalidad. Si
          no estás de acuerdo, no uses el servicio.
        </p>
      </Section>

      <Section title="3. Triage NO es asesoría financiera">
        <p>
          <strong>
            Triage proporciona análisis educativo, no asesoría financiera
            personalizada.
          </strong>{" "}
          Las recomendaciones, planes, simulaciones, proyecciones y números
          mostrados son orientativos y se basan en patrones generales y modelos
          estadísticos, no en tu situación financiera completa.
        </p>
        <p>
          Para decisiones específicas de inversión, deuda, planeación
          tributaria, jubilación, sucesión, seguros u otros productos
          financieros, debes consultar con un asesor financiero acreditado en
          tu jurisdicción. Triage no es responsable de las decisiones que tomes
          basadas en la información mostrada en la plataforma.
        </p>
      </Section>

      <Section title="4. Cuenta y elegibilidad">
        <p>
          Para usar las funciones que requieren cuenta debes ser mayor de edad
          en tu país de residencia. Eres responsable de mantener la
          confidencialidad de tu acceso. Si detectas uso no autorizado,
          notifícanos inmediatamente a{" "}
          <a href="mailto:hola@triagefinanciero.com">hola@triagefinanciero.com</a>.
        </p>
      </Section>

      <Section title="5. Planes, precios y cancelación">
        <p>
          Triage ofrece un nivel gratuito y planes de suscripción mensual. Los
          precios están publicados en la plataforma y pueden cambiar con
          notificación previa de 30 días. Las suscripciones se renuevan
          automáticamente hasta que las canceles desde tu panel de cuenta. Al
          cancelar, mantienes acceso hasta el final del período pagado y no se
          emiten reembolsos prorrateados, salvo que la ley aplicable lo exija.
        </p>
        <p>
          Los pagos se procesan mediante Stripe. Triage no almacena los datos
          de tu tarjeta de crédito.
        </p>
      </Section>

      <Section title="6. Prueba gratuita">
        <p>
          Si activas un período de prueba (típicamente 15 días), al final del
          mismo se cobrará automáticamente el plan elegido a la tarjeta
          registrada, salvo que canceles antes. Recibirás un recordatorio por
          correo electrónico antes del primer cobro.
        </p>
      </Section>

      <Section title="7. Inteligencia artificial y precisión de los resultados">
        <p>
          Triage utiliza modelos de inteligencia artificial (Claude de
          Anthropic) para generar texto interpretativo, planes y respuestas
          conversacionales. Estos modelos pueden cometer errores, omitir
          contexto importante, o producir información imprecisa. No te bases
          en outputs de IA para decisiones financieras críticas sin validación
          humana profesional.
        </p>
        <p>
          Los cálculos numéricos se realizan en código tradicional, no en IA.
          Sin embargo, las proyecciones a largo plazo (#4 y #5 de los “5
          números”) son estimaciones aproximadas (rango ±30%) basadas en
          supuestos estándar de retorno real (~7% anual) e inflación (~3%
          anual). Tu rendimiento real puede diferir significativamente.
        </p>
      </Section>

      <Section title="8. Uso aceptable">
        <p>Te comprometes a NO:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Usar Triage para fines ilegales o que violen los derechos de terceros</li>
          <li>
            Hacer scraping automatizado, ingeniería inversa, o extraer datos del
            servicio
          </li>
          <li>Compartir tu cuenta con otros usuarios</li>
          <li>
            Usar Triage para ofrecer asesoría financiera profesional a terceros,
            salvo acuerdo escrito con nosotros
          </li>
        </ul>
      </Section>

      <Section title="9. Propiedad intelectual">
        <p>
          El contenido de Triage, incluyendo el sistema de 27 arquetipos
          patrimoniales, el cuestionario, los simuladores, el diseño y los
          textos, son propiedad de Triage Financiero LLC y están protegidos por
          leyes de derechos de autor. Tienes una licencia limitada, no
          exclusiva e intransferible para uso personal del servicio mientras
          tu cuenta esté activa.
        </p>
      </Section>

      <Section title="10. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley, Triage Financiero LLC no
          será responsable por pérdidas financieras, daños indirectos,
          consecuenciales, o lucro cesante derivados del uso del servicio. La
          responsabilidad máxima de Triage hacia ti se limita al monto que
          hayas pagado a Triage en los 12 meses anteriores al hecho que origina
          el reclamo.
        </p>
      </Section>

      <Section title="11. Modificaciones">
        <p>
          Podemos actualizar estos términos. Si los cambios son materiales, te
          notificaremos por correo electrónico con al menos 14 días de
          antelación. El uso continuado del servicio después de la entrada en
          vigor implica aceptación.
        </p>
      </Section>

      <Section title="12. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes del estado de Delaware, Estados
          Unidos, sin atender a sus principios de conflicto de leyes. Cualquier
          disputa se resolverá en los tribunales competentes de Delaware,
          salvo que la ley aplicable de tu país exija otra jurisdicción para
          consumidores.
        </p>
      </Section>

      <Section title="13. Contacto">
        <p>
          ¿Preguntas sobre estos términos? Escribe a{" "}
          <a href="mailto:hola@triagefinanciero.com">hola@triagefinanciero.com</a>.
        </p>
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
