import { Root, FetchEvents } from '@/queries/types';
import { PropsWithChildren, useMemo } from 'react';
import { createContext } from 'react';
import useWebSocket from 'react-use-websocket';
import { WebSocketLike } from 'react-use-websocket/dist/lib/types';
import { v4 } from 'uuid';

type RemoveListenerCb = () => void;

export type Conn = {
  ws: WebSocketLike | null;
  addListener: (nonce: string, cb: (data: unknown) => void) => RemoveListenerCb;
  sendJsonMessage: (json: Record<string, unknown>) => void;

  queries: {
    GENERATE_TREE: (path?: string) => Promise<Root>;
    FILE_CONTENT: (filePath: string) => Promise<string>;
  };
};

export const WSContext = createContext<{
  conn: Conn | null;
}>({
  conn: null,
});

const listeners: Map<string, (data: unknown) => void> = new Map();

export function WebSocketProvider({ children }: PropsWithChildren) {
  const { getWebSocket, sendJsonMessage, readyState } = useWebSocket(
    'ws://localhost:3001',
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

  const addListener = (nonce: string, cb: (data: unknown) => void) => {
    listeners.set(nonce, cb);
    console.log('added listener for nonce: ' + nonce);

    return () => listeners.delete(nonce);
  };

  const fetchCall = (query: FetchEvents, data: unknown) => {
    const nonce = v4();

    sendJsonMessage({
      nonce,
      event: query,
      data,
    });

    const p = new Promise<unknown>((res, rej) => {
      let timeout: NodeJS.Timeout | null = null;

      const removeListener = addListener(nonce, (data) => {
        console.log('resolved query with nonce ' + nonce);
        if (timeout) clearTimeout(timeout);

        removeListener();
        res(data);
      });

      timeout = setTimeout(() => {
        removeListener();
        rej('Query timed out');
      }, 3000);
    });

    return p;
  };

  return (
    <WSContext.Provider
      value={useMemo(
        () => ({
          sendJsonMessage,
          conn: {
            ws: getWebSocket(),
            sendJsonMessage,
            addListener,
            queries: {
              GENERATE_TREE(path) {
                return fetchCall('GENERATE_TREE', {
                  path,
                }) as Promise<Root>;
              },
              FILE_CONTENT(filePath) {
                return fetchCall('FILE_CONTENT', {
                  filePath,
                }) as Promise<string>;
              },
            },
          },
        }),

        [readyState, getWebSocket, sendJsonMessage, fetchCall, addListener]
      )}
    >
      {children}
    </WSContext.Provider>
  );
}
