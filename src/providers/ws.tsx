import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { createContext } from 'react';

export const WSContext = createContext<{
  conn: WebSocket | null;
}>({
  conn: null,
});

export function WebSocketProvider({ children }: PropsWithChildren) {
  const [conn, setConn] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!conn) {
      const ws = new WebSocket('ws://localhost:3000');
      setConn(ws);

      ws.onopen = () => {
        console.log('Connection opened');

        // @ts-expect-error For dev
        window.conn = ws;
      };
    }

    return () => {
      if (conn) {
        conn.close();
      }
    };
  }, [conn]);

  return (
    <WSContext.Provider value={useMemo(() => ({ conn }), [conn])}>
      {children}
    </WSContext.Provider>
  );
}
