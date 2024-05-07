import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL = import.meta.env.VITE_API_URL;
export const APPS_URL = import.meta.env.VITE_APPS_URL;
export const APPS_WS_URL = APPS_URL.replace("https", "wss");
