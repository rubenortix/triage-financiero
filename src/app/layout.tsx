import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Triage Financiero",
    template: "%s · Triage Financiero",
  },
  description:
    "La primera plataforma de finanzas personales para médicos hispanohablantes. Diagnóstico patrimonial, decisiones asistidas por IA y coaching mensual.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://triagefinanciero.com",
  ),
  openGraph: {
    title: "Triage Financiero",
    description:
      "Le hacemos triage a tu vida financiera. En 3 minutos sabes dónde estás.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
