import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

/* Body — Geist tiene personalidad sin caer en Inter */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/* Mono — números, códigos de arquetipo, datos tabulares */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* Headings — Instrument Serif italic da el aire editorial médico */
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
    <html
      lang="es"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
