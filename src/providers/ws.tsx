import { PropsWithChildren, useMemo } from 'react';
import { createContext } from 'react';
import useWebSocket from 'react-use-websocket';
import { WebSocketLike } from 'react-use-websocket/dist/lib/types';

type RemoveListenerCb = () => void;

export type Conn = {
  ws: WebSocketLike | null;
  addListener: (nonce: string, cb: (data: unknown) => void) => RemoveListenerCb;
  sendJsonMessage: (json: Record<string, unknown>) => void;
};

export const WSContext = createContext<{
  conn: Conn | null;
}>({
  conn: null,
});

const listeners: Map<string, (data: unknown) => void> = new Map();

export function WebSocketProvider({ children }: PropsWithChildren) {
  const { getWebSocket, sendJsonMessage, readyState } = useWebSocket(
    'ws://localhost:3000',
    {
      onOpen() {
        console.log('Connection opened');
      },
      onMessage(e) {
        const reply = JSON.parse(e.data) as { nonce: string; data: unknown };

        console.log('Got reply with nonce: ' + reply.nonce);

        const handler = listeners.get(reply.nonce);
        if (!handler) {
          console.log('no handler found for message', reply);
          return;
        }

        handler(reply.data);
      },
    }
  );

  return (
    <WSContext.Provider
      value={useMemo(
        () => ({
          sendJsonMessage,
          conn: {
            ws: getWebSocket(),
            addListener(nonce, cb) {
              listeners.set(nonce, cb);
              console.log('added listener for nonce: ' + nonce);

              return () => listeners.delete(nonce);
            },
            sendJsonMessage,
          },
        }),
        [readyState, getWebSocket, sendJsonMessage]
      )}
    >
      {children}
    </WSContext.Provider>
  );
}
