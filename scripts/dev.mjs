/**
 * Wrapper de `next dev` que limpia variables de entorno potencialmente
 * heredadas del shell padre (especialmente Claude Code, que setea
 * ANTHROPIC_API_KEY="" y ANTHROPIC_BASE_URL en su bash).
 *
 * Next.js usa dotenv con override:false, así que si una variable ya existe
 * en process.env (aunque sea vacía), .env.local no la sobreescribe.
 *
 * Borrar aquí garantiza que .env.local siempre gane.
 */

import { spawn } from "node:child_process";

const VARS_A_LIMPIAR = [
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_AUTH_TOKEN",
];

for (const k of VARS_A_LIMPIAR) {
  if (k in process.env) {
    delete process.env[k];
  }
}

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
