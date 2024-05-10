import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@/styles/xterm.css";
import { Dimensions } from "@/lib/types";
import { useConnection } from "@/hooks/use-connection";

interface TerminalXProps {
  terminal: Terminal;
  dimensions: Dimensions | undefined;
  fitTerm: () => void;
  forceFit: () => void;
  onReady: () => void;
}

export function TerminalX({
  dimensions,
  terminal,
  fitTerm,
  forceFit,
  onReady,
}: TerminalXProps) {
  const termRef = useRef<HTMLDivElement | null>(null);
  const { conn } = useConnection();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!conn) return;

    const rm = conn.addSubscription<string>("TERMINAL_DATA", (data) => {
      terminal.write(data);
    });

    return () => rm();
  }, []);

  useEffect(() => {
    if (!termRef.current || !conn?.isReady) return;

    conn.queries.TERMINAL_SESSION_START().then(() => {
      console.log("opened terminal");
      terminal.reset();
      terminal.clear();

      terminal.onData((cmd) => {
        conn.fireEvent("TERMINAL_USER_CMD", {
          cmd,
        });
      });

      if (termRef.current) {
        terminal.open(termRef.current);
        onReady();
        forceFit();
      }
    });

    return () => {
      hasRequested.current = true;
    };
  }, [termRef, terminal, conn]);

  useEffect(() => {
    const onResizeWindow = () => {
      fitTerm();
    };

    window.addEventListener("resize", onResizeWindow);
    return () => {
      window.removeEventListener("resize", onResizeWindow);
    };
  }, [fitTerm]);

  useEffect(() => {
    if (!dimensions || !conn?.isReady) return;
    console.log("sending resize_terminal", dimensions);
    conn.fireEvent("RESIZE_TERMINAL", {
      cols: terminal.cols,
      rows: terminal.rows,
    });
  }, [dimensions, conn, terminal]);

  return (
    <div style={{ height: "100%" }} className="text-left" ref={termRef}></div>
  );
}
