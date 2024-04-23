import { Root, FetchEvents, ServerEvent } from '@/queries/types';
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
  };

  fetchCall<T = unknown>(key: FetchEvents, data: unknown): Promise<T>;
  addSubscription<T = unknown>(
    event: ServerEvent,
    cb: (data: T) => void
  ): () => void;
};

export const WSContext = createContext<{
  conn: Conn | null;
}>({
  conn: null,
});

const listeners: Map<string, (data: unknown) => void> = new Map();
const subscriptions: Map<
  string,
  Map<string, (data: unknown) => void>
> = new Map();

export function WebSocketProvider({ children }: PropsWithChildren) {
  const { getWebSocket, sendJsonMessage, readyState } = useWebSocket(
    'ws://localhost:3001',
    {
      onOpen() {
        console.log('Connection opened');
      },
      onMessage(e) {
        const reply = JSON.parse(e.data) as {
          nonce?: string;
          data: unknown;
          serverEvent?: ServerEvent;
        };

        if (reply.serverEvent) {
          for (const cb of subscriptions.get(reply.serverEvent) || []) {
            cb[1](reply.data);
          }
          return;
        }

        const handler = listeners.get(reply.nonce!);
        if (!handler) {
          console.log('no handler found for message', reply);
          return;
        }

        handler(reply.data);
      },
      reconnectAttempts: 5,
      shouldReconnect: () => true,
    }
  );

  const addListener = (nonce: string, cb: (data: unknown) => void) => {
    listeners.set(nonce, cb);

    return () => listeners.delete(nonce);
  };

  function fetchCall<T = unknown>(
    query: FetchEvents,
    data: unknown
  ): Promise<T> {
    const nonce = v4();

    sendJsonMessage({
      nonce,
      event: query,
      data,
    });

    const p = new Promise<T>((res, rej) => {
      let timeout: NodeJS.Timeout | null = null;

      const removeListener = addListener(nonce, (data) => {
        if (timeout) clearTimeout(timeout);

        removeListener();
        res(data as T);
      });

      timeout = setTimeout(() => {
        removeListener();
        rej('Query timed out');
      }, 3000);
    });

    return p;
  }

  function addSubscriptionForServerEvent<T = unknown>(
    event: ServerEvent,
    cb: (data: T) => void
  ) {
    let subs = subscriptions.get(event);
    const id = v4();

    if (!subs) {
      subscriptions.set(event, new Map());
      subs = subscriptions.get(event)!;
    }

    subs.set(id, cb as any);

    return () => {
      subs.delete(id);
    };
  }

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
            },
            // This is provided when no state management for query is required
            fetchCall,
            addSubscription: addSubscriptionForServerEvent,
          },
        }),
        [
          readyState,
          getWebSocket,
          addSubscriptionForServerEvent,
          sendJsonMessage,
          fetchCall,
          addListener,
        ]
      )}
    >
      {children}
    </WSContext.Provider>
  );
}
