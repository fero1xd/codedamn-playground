import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@/styles/xterm.css";
import { Dimensions } from "@/lib/types";
import { useConnection } from "@/hooks/use-connection";

export function TerminalX({
  dimensions,
  terminal,
  fitTerm,
  forceFit,
  onReady,
}: {
  terminal: Terminal;
  dimensions: Dimensions | undefined;
  fitTerm: () => void;
  forceFit: () => void;
  onReady: () => void;
}) {
  const termRef = useRef<HTMLDivElement | null>(null);
  const conn = useConnection();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!conn) return;

    const rm = conn.addSubscription("TERMINAL_DATA", (data: string) => {
      terminal.write(data);
    });

    return () => rm();
  }, []);

  useEffect(() => {
    if (!termRef.current || !conn || !conn.isReady || hasRequested.current)
      return;

    terminal.onData((cmd) => {
      conn.sendJsonMessage({
        nonce: "__ignored__",
        event: "TERMINAL_USER_CMD",
        data: { cmd },
      });
    });

    conn.sendJsonMessage({
      event: "TERMINAL_SESSION_START",
      nonce: "__terminal__start",
    });

    console.log("opening terminall");
    forceFit();

    if (termRef.current) {
      terminal.open(termRef.current);
      onReady();
      setTimeout(() => {
        forceFit();
        forceFit();
      }, 500);
    }

    return () => {
      hasRequested.current = true;
    };
  }, [termRef, terminal, fitTerm, conn]);

  useEffect(() => {
    const onResizeWindow = () => {
      console.log("resize");
      fitTerm();
    };

    window.addEventListener("resize", onResizeWindow);
    return () => {
      window.removeEventListener("resize", onResizeWindow);
    };
  }, [fitTerm]);

  useEffect(() => {
    if (!dimensions || !conn || !conn.isReady || !terminal) return;

    conn.sendJsonMessage({
      event: "RESIZE_TERMINAL",
      nonce: "__ignore__",
      data: {
        cols: terminal.cols,
        rows: terminal.rows,
      },
    });
  }, [dimensions, conn, terminal]);

  return (
    <div style={{ height: "100%" }} className="text-left" ref={termRef}></div>
  );
}
