import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Coincide con todo excepto:
     * - api de Stripe webhooks
     * - rutas de Next.js internas (_next, static, image)
     * - archivos con extensión (favicon, etc.)
     */
    "/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
