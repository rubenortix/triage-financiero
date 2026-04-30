/**
 * Templates de email en HTML simple compatible con todos los clientes.
 * Mantiene la voz de marca Triage: médica, empática, directa.
 *
 * Cada email incluye disclaimer regulatorio y un footer mínimo.
 */

const BRAND = "Triage Financiero";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DISCLAIMER =
  "Triage Financiero proporciona análisis educativo, no asesoría financiera personalizada. Para decisiones específicas de inversión, consulta con un asesor financiero acreditado en tu jurisdicción.";

interface BaseEmail {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  body { margin: 0; padding: 0; background: #faf7f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #14110d; line-height: 1.6; }
  .container { max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; }
  .brand { font-size: 14px; font-weight: 500; color: #064e3b; letter-spacing: 0.05em; margin-bottom: 32px; }
  h1 { font-size: 28px; line-height: 1.25; font-weight: 600; margin: 0 0 16px; color: #14110d; }
  h2 { font-size: 18px; line-height: 1.3; font-weight: 600; margin: 28px 0 12px; color: #14110d; }
  p { margin: 0 0 16px; color: #14110d; font-size: 16px; }
  .muted { color: #57534e; font-size: 14px; }
  .button { display: inline-block; background: #064e3b; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; margin: 16px 0; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e7e0cf; font-size: 12px; color: #57534e; }
  a { color: #064e3b; text-decoration: underline; }
  ul { padding-left: 20px; margin: 0 0 16px; }
  li { margin-bottom: 8px; }
`;

function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <p class="brand">⚕ ${BRAND}</p>
    ${content}
    <div class="footer">
      <p>${DISCLAIMER}</p>
      <p>© ${new Date().getFullYear()} ${BRAND} · <a href="${SITE_URL}">${SITE_URL.replace(/^https?:\/\//, "")}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// =============================================================
// Welcome — primera vez que el usuario crea cuenta
// =============================================================

export function welcomeEmail(args: { nombre?: string | null }): BaseEmail {
  const saludo = args.nombre ? `Hola, ${args.nombre}` : "Bienvenido";
  const subject = "Tu primera consulta de Triage está lista";

  const html = shell(`
    <h1>${saludo}.</h1>
    <p>Acabas de unirte a la primera plataforma de finanzas personales para médicos hispanohablantes.</p>
    <p>Tu próximo paso son <strong>10 preguntas en 3 minutos</strong>. Te ubicamos en uno de 27 arquetipos patrimoniales y te damos tu pulso 0–10 — sin jerga, sin asesores que te quieren vender cosas.</p>
    <p style="text-align: center;">
      <a class="button" href="${SITE_URL}/diagnostico">Empezar mi diagnóstico</a>
    </p>
    <h2>Lo que vas a recibir</h2>
    <ul>
      <li>Un diagnóstico médico-financiero con los 5 números que tienes que saber</li>
      <li>Un Plan 90 días personalizado por IA según tu arquetipo</li>
      <li>Recordatorio mensual para volver a medir tu pulso</li>
    </ul>
    <p class="muted">Si tienes preguntas, responde directo a este email — lo lee Rubén.</p>
  `);

  const text = `${saludo}.

Acabas de unirte a la primera plataforma de finanzas personales para médicos hispanohablantes.

Tu próximo paso son 10 preguntas en 3 minutos. Te ubicamos en uno de 27 arquetipos patrimoniales y te damos tu pulso 0-10.

Empezar diagnóstico: ${SITE_URL}/diagnostico

Lo que vas a recibir:
- Diagnóstico con los 5 números que tienes que saber
- Plan 90 días personalizado por IA
- Recordatorio mensual para volver a medir

Si tienes preguntas, responde directo a este email.

${DISCLAIMER}`;

  return { subject, html, text };
}

// =============================================================
// Recordatorio mensual — cuando han pasado ~30 días sin re-diagnóstico
// =============================================================

export function recordatorioMensualEmail(args: {
  nombre?: string | null;
  diasDesdeUltimo: number;
  scoreActual: number;
  arquetipoNombre: string;
  nivel: "Vulnerabilidad" | "Estabilidad" | "Optimización";
}): BaseEmail {
  const saludo = args.nombre ? `Hola, ${args.nombre}` : "Hola";
  const subject = `Han pasado ${args.diasDesdeUltimo} días — ¿cómo va tu pulso?`;

  const html = shell(`
    <h1>${saludo}.</h1>
    <p>Han pasado <strong>${args.diasDesdeUltimo} días</strong> desde tu último diagnóstico Triage.</p>
    <p>Tu último pulso fue <strong>${args.scoreActual}/10</strong> (${args.nivel}) y caíste en el arquetipo <em>${args.arquetipoNombre}</em>.</p>
    <p>Mide tu pulso de nuevo — es lo único que te dice si tu plan está funcionando o si es momento de ajustar.</p>
    <p style="text-align: center;">
      <a class="button" href="${SITE_URL}/diagnostico">Volver a hacer triage</a>
    </p>
    <p class="muted">3 minutos. 10 preguntas. Te genero un nuevo Plan 90 días basado en tu evolución.</p>
  `);

  const text = `${saludo}.

Han pasado ${args.diasDesdeUltimo} días desde tu último diagnóstico Triage.

Tu último pulso fue ${args.scoreActual}/10 (${args.nivel}) — arquetipo ${args.arquetipoNombre}.

Mide tu pulso de nuevo. 3 minutos. Te genero un nuevo Plan 90 días con la evolución.

Volver a hacer triage: ${SITE_URL}/diagnostico

${DISCLAIMER}`;

  return { subject, html, text };
}
