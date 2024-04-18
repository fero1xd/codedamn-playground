import { z } from 'zod';
export function parseJSON(raw: string) {
  try {
    return {
      success: true,
      data: JSON.parse(raw),
    };
  } catch {
    return {
      success: false,
    };
  }
}
