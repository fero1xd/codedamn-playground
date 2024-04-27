import { Root, FetchEvents, ServerEvent } from "@/queries/types";
import { PropsWithChildren, useRef } from "react";
import { createContext } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";
import { v4 } from "uuid";

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

export function WebSocketProvider({ children }: PropsWithChildren) {
  const listeners = useRef<Map<string, (data: unknown) => void>>(new Map());
  const subscriptions = useRef<
    Map<string, Map<string, (data: unknown) => void>>
  >(new Map());

  const { sendJsonMessage, getWebSocket, readyState } = useWebSocket(
    "ws://localhost:3000",
    {
      onOpen() {
        console.log("Connection opened");
      },
      onMessage(e) {
        const reply = JSON.parse(e.data) as {
          nonce?: string;
          data: unknown;
          serverEvent?: ServerEvent;
        };

        if (reply.serverEvent) {
          for (const cb of subscriptions.current.get(reply.serverEvent) || []) {
            cb[1](reply.data);
          }
          return;
        }

        const handler = listeners.current.get(reply.nonce!);
        if (!handler) {
          console.log("no handler found for message", reply);
          return;
        }

        handler(reply.data);
      },
      reconnectAttempts: 5,
      shouldReconnect: () => true,
    }
  );

  // const sendJsonMessage = useCallback(
  //   (data: Record<string, unknown>) => {
  //     if (ws.current.readyState === 1) {
  //       ws.current.send(JSON.stringify(data));
  //     }
  //   },
  //   [ws]
  // );

  // useEffect(() => {
  //   ws.current.onopen = () => {
  //     setReady(ws.current.readyState);
  //   };

  //   ws.current.onmessage = (e) => {
  //     const reply = JSON.parse(e.data) as {
  //       nonce?: string;
  //       data: unknown;
  //       serverEvent?: ServerEvent;
  //     };

  //     if (reply.serverEvent) {
  //       for (const cb of subscriptions.get(reply.serverEvent) || []) {
  //         cb[1](reply.data);
  //       }
  //       return;
  //     }

  //     const handler = listeners.get(reply.nonce!);
  //     if (!handler) {
  //       console.log("no handler found for message", reply);
  //       return;
  //     }

  //     handler(reply.data);
  //   };
  // }, []);

  const addListener = (nonce: string, cb: (data: unknown) => void) => {
    listeners.current.set(nonce, cb);

    return () => listeners.current.delete(nonce);
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
        rej("Query timed out");
      }, 3000);
    });

    return p;
  }

  function addSubscriptionForServerEvent<T = unknown>(
    event: ServerEvent,
    cb: (data: T) => void
  ) {
    let subs = subscriptions.current.get(event);
    const id = v4();

    if (!subs) {
      subscriptions.current.set(event, new Map());
      subs = subscriptions.current.get(event)!;
    }

    subs.set(id, cb as any);

    return () => {
      subs.delete(id);
    };
  }

  return (
    <WSContext.Provider
      value={{
        conn: {
          ws: getWebSocket(),
          sendJsonMessage,
          addListener,
          queries: {
            GENERATE_TREE(path) {
              return fetchCall("GENERATE_TREE", {
                path,
              }) as Promise<Root>;
            },
          },
          // This is provided when no state management for query is required
          fetchCall,
          addSubscription: addSubscriptionForServerEvent,
        },
      }}
    >
      {children}
    </WSContext.Provider>
  );
}
