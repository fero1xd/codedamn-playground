import { incomingMessage } from './validate';

export function parseMessage(json: Record<string, unknown>) {
  try {
    const data = incomingMessage.parse(json);

    return { success: true, data };
  } catch {
    return {
      success: false,
    };
  }
}
