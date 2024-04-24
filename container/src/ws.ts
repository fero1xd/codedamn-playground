import WebSocket from 'ws';
import { type ResponseType } from './types';
import { incomingMessage } from './validate';

export const parseMessage = (json: Record<string, unknown>) => {
  try {
    const data = incomingMessage.parse(json);

    return { success: true, data };
  } catch {
    return {
      success: false,
    };
  }
};

export const sendResponse = (data: ResponseType, ws: WebSocket) => {
  ws.send(JSON.stringify(data));
};
