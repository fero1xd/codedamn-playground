import { Root, FetchEvents, ServerEvent, WSEvents } from "@/queries/types";
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
import { ContainerPaused } from "@/components/container-paused";

export type Conn = {
  isReady: boolean;
  sendJsonMessage: (json: Record<string, unknown>) => void;

  queries: {
    GENERATE_TREE: (path?: string) => Promise<Root>;
    GET_PROJECT_FILES: () => Promise<string[]>;
    TERMINAL_SESSION_START: () => Promise<void>;
  };

  fetchCall<T = unknown>(key: FetchEvents, data?: unknown): Promise<T>;
  addSubscription<T = unknown>(
    event: ServerEvent,
    cb: (data: T) => void
  ): () => void;

  fireEvent: (event: WSEvents, data: unknown) => void;
};

export const WSContext = createContext<Conn | null>(null);

type WebSocketProviderProps = PropsWithChildren & {
  playgroundId: string;
  onConnected: () => void;
  onFailure: () => void;
  onReconnect: () => void;
};

export function WebSocketProvider({
  children,
  playgroundId,
  onConnected,
  onFailure,
  onReconnect,
}: WebSocketProviderProps) {
  const listeners = useRef<Map<string, (data: unknown) => void>>(new Map());
  const subscriptions = useRef<
    Map<string, Map<string, (data: unknown) => void>>
  >(new Map());

  const [conn, setConn] = useState<ReconnectingWebSocket>();
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const hasInstance = useRef(false);
  const hasOpenedOnce = useRef(false);

  useEffect(() => {
    if (!conn && !hasInstance.current) {
      const ws = new ReconnectingWebSocket(
        `wss://${playgroundId}-3001.app.soketto.dev`,
        [],
        {
          connectionTimeout: 15000,
          maxRetries: 5,
        }
      );
      // @ts-expect-error just for dev
      window.ws = ws;

      ws.onopen = () => {
        console.log("ws connection opened");

        if (ws.retryCount > 0 || hasOpenedOnce.current) {
          onReconnect();
        }

        hasOpenedOnce.current = true;
        onConnected();
        setConn(ws);
        setIsReady(true);
      };
      ws.onclose = (e) => {
        console.log("ws connection closed");
        console.log(e);

        if (ws.retryCount >= 5) {
          onFailure();
          console.log("reconnection failed");
        }

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
    [isReady, conn]
  );

  const addListener = (nonce: string, cb: (data: unknown) => void) => {
    listeners.current.set(nonce, cb);

    return () => listeners.current.delete(nonce);
  };

  function fetchCall<T = unknown>(
    query: FetchEvents,
    data?: unknown
  ): Promise<T> {
    const nonce = v4();

    sendJsonMessage({
      nonce,
      event: query,
      data: data || {},
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

  function fireEvent(event: WSEvents, data: unknown) {
    sendJsonMessage({
      nonce: "__IGNORED__",
      event: event,
      data: data,
    });
  }

  useEffect(() => {
    const removeSub = addSubscriptionForServerEvent("PLAYGROUND_PAUSED", () => {
      console.log("playground paused");
      setIsPaused(true);
      conn?.close();
    });

    return () => {
      removeSub();
    };
  }, [conn]);

  return (
    <WSContext.Provider
      value={useMemo(
        () => ({
          isReady,
          sendJsonMessage,
          queries: {
            GENERATE_TREE(path) {
              return fetchCall("GENERATE_TREE", {
                path,
              }) as Promise<Root>;
            },
            GET_PROJECT_FILES() {
              return fetchCall("GET_PROJECT_FILES", {}) as Promise<string[]>;
            },
            TERMINAL_SESSION_START() {
              return fetchCall("TERMINAL_SESSION_START") as Promise<void>;
            },
          },
          fireEvent,
          // This is provided when no state management for query is required
          fetchCall,
          addSubscription: addSubscriptionForServerEvent,
        }),
        [conn, isReady]
      )}
    >
      <ContainerPaused open={isPaused} />
      {children}
    </WSContext.Provider>
  );
}
