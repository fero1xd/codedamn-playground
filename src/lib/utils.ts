import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAsciiDiff(a: string, b: string) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const ascii1 = a.charCodeAt(i);
    const ascii2 = b.charCodeAt(i);

    if (ascii1 !== ascii2) {
      return ascii1 - ascii2;
    }
  }

  return 0;
}
export function getSubDomain(sub: string, ws = false) {
  return `${IS_SECURE === "true" ? (ws ? "wss" : "https") : ws ? "ws" : "http"}://${sub}.${PG_DOMAIN}`;
}

export const API_URL = import.meta.env.VITE_API_URL;
export const PG_DOMAIN = import.meta.env.VITE_PG_SUBDOMAIN;
export const IS_SECURE = import.meta.env.VITE_IS_SECURE;
