import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  premium: process.env.STRIPE_PRICE_PREMIUM ?? "",
  circulo: process.env.STRIPE_PRICE_CIRCULO ?? "",
} as const;

export const TRIAL_DAYS = 15;
