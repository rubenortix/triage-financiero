/**
 * Escapa caracteres HTML especiales en strings que se van a embeber
 * en HTML (ej. plantillas de email). Defense-in-depth — incluso si los
 * datos vienen de la DB, no asumimos que son seguros.
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c);
}
