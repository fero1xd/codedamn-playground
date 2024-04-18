import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { createContext } from 'react';

export type Conn = {
  ws: WebSocket;
  addListener: (nonce: string, cb: (data: unknown) => void) => void;
};

export const WSContext = createContext<{
  conn: Conn | null;
}>({
  conn: null,
});

export function WebSocketProvider({ children }: PropsWithChildren) {
  const [conn, setConn] = useState<Conn | null>(null);

  useEffect(() => {
    if (!conn) {
      const ws = new WebSocket('ws://localhost:3000');

      const listeners: Map<string, (data: unknown) => void> = new Map();

      ws.onopen = () => {
        console.log('Connection opened');

        // @ts-expect-error For dev
        window.conn = ws;
      };

      ws.onmessage = (e) => {
        const reply = JSON.parse(e.data) as { nonce: string; data: unknown };

        const handler = listeners.get(reply.nonce);
        if (!handler) {
          console.log('no handler found for message', reply);
          return;
        }

        handler(reply.data);
      };

      setConn({
        ws,
        addListener: (nonce, cb) => {
          listeners.set(nonce, cb);

          return () => listeners.delete(nonce);
        },
      });
    }

    return () => {
      if (conn) {
        conn.ws.close();
      }
    };
  }, [conn]);

  return (
    <WSContext.Provider value={useMemo(() => ({ conn }), [conn])}>
      {children}
    </WSContext.Provider>
  );
}
