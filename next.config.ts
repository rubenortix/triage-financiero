import type { NextConfig } from "next";

/**
 * Security headers aplicados a todas las rutas. Defense-in-depth para que un
 * eventual XSS no tenga las mismas capacidades.
 *
 * Notas:
 * - X-Frame-Options DENY: previene clickjacking (nadie embebe Triage en iframe)
 * - Permissions-Policy: bloquea APIs sensibles que no usamos
 * - Strict-Transport-Security: fuerza HTTPS por 1 año (cuando esté en prod
 *   detrás de Vercel ya cumple esto, pero lo declaramos explícito)
 * - Sin CSP estricto por ahora — Tailwind + Next.js inline styles + fonts de
 *   Google requerirían whitelist específica. Lo agregamos cuando pase a deploy
 *   estable.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
