import { Root, FetchEvents, ServerEvent } from "@/queries/types";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createContext } from "react";
import { v4 } from "uuid";
import ReconnectingWebSocket from "reconnecting-websocket";

export type Conn = {
  // ws: WebSocketLike | null;
  isReady: boolean;
  sendJsonMessage: (json: Record<string, unknown>) => void;

  queries: {
    GENERATE_TREE: (path?: string) => Promise<Root>;
    GET_PROJECT_FILES: () => Promise<Record<string, string>>;
  };

  fetchCall<T = unknown>(key: FetchEvents, data: unknown): Promise<T>;
  addSubscription<T = unknown>(
    event: ServerEvent,
    cb: (data: T) => void
  ): () => void;
};

export const WSContext = createContext<Conn | null>(null);

type WebSocketProviderProps = PropsWithChildren & {
  playgroundId: string;
};

export function WebSocketProvider({
  children,
  playgroundId,
}: WebSocketProviderProps) {
  const listeners = useRef<Map<string, (data: unknown) => void>>(new Map());
  const subscriptions = useRef<
    Map<string, Map<string, (data: unknown) => void>>
  >(new Map());

  const [conn, setConn] = useState<ReconnectingWebSocket>();
  const [isReady, setIsReady] = useState(false);
  const hasInstance = useRef(false);

  useEffect(() => {
    if (!conn && !hasInstance.current) {
      const ws = new ReconnectingWebSocket(
        `ws://${playgroundId}-3001.localhost`
      );
      ws.onopen = () => {
        console.log("reconnecting ws connected");
        setConn(ws);
        setIsReady(true);
      };
      ws.onclose = () => {
        console.log("broken");
        setIsReady(false);
      };
      ws.onmessage = (e) => {
        const reply = JSON.parse(e.data) as {
          nonce?: string;
          data: unknown;
          serverEvent?: ServerEvent;
        };

        if (reply.serverEvent) {
          console.log("server event ", reply.serverEvent);
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
      };
    }

    return () => {
      console.log("running ws provider cleanup");
      hasInstance.current = true;
      conn?.close();
    };
  }, [conn]);

  const sendJsonMessage = useCallback(
    (data: Record<string, unknown>) => {
      if (!conn) return;

      if (conn.readyState === 1) {
        conn.send(JSON.stringify(data));
      }
    },
    [conn]
  );

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
        rej("Query timed out " + query);
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
      value={useMemo(() => {
        return {
          isReady,
          sendJsonMessage,
          queries: {
            GENERATE_TREE(path) {
              return fetchCall("GENERATE_TREE", {
                path,
              }) as Promise<Root>;
            },
            GET_PROJECT_FILES() {
              console.log("ws context getting files");
              return fetchCall("GET_PROJECT_FILES", {}) as Promise<
                Record<string, string>
              >;
            },
          },
          // This is provided when no state management for query is required
          fetchCall,
          addSubscription: addSubscriptionForServerEvent,
        };
      }, [isReady])}
    >
      {children}
    </WSContext.Provider>
  );
}
