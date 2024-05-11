import { Editor } from "@/components/editor";
import { createFileRoute } from "@tanstack/react-router";
import { FileTree } from "@/components/file-tree";
import { useTerminal } from "@/hooks/use-terminal";
import { useEffect, useRef, useState } from "react";
import { TerminalX } from "@/components/terminal";
import { Browser } from "@/components/browser";
import { Layout } from "@/layout";
import { Navbar } from "@/components/navbar";
import { usePgLoading } from "@/hooks/use-pg-loading";
import { LoadingPanel } from "@/playground/loading";
import { WebSocketProvider } from "@/providers/ws";
import Confetti from "react-confetti";
import { API_URL, getSubDomain } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export const Route = createFileRoute("/playground/$pgId")({
  component: Playground,
});

function Playground() {
  const { pgId } = Route.useParams();
  const { dimensions, fitTerm, terminal, forceFit } = useTerminal();
  const { toast } = useToast();

  const { isReady, status, setStatus } = usePgLoading();

  const isFetching = useRef(false);
  const [host, setHost] = useState<string>();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const doIt = async () => {
      if (isFetching.current) return;

      const res = await fetch(`${API_URL}/playgrounds/boot/${pgId}`, {
        method: "POST",
      });

      setStatus("sentContainerReq", () => ({
        loading: false,
        success: res.ok,
      }));

      setTimeout(() => {
        // Give some time for wss server to get started
        setStatus("containerBooted", () => ({
          loading: false,
          success: res.ok,
        }));
      }, 1500);

      if (!res.ok) {
        console.log("not good response");
      }

      const msg = (await res.json()) as { host: string; isFirstBoot: boolean };
      setHost(msg.host);
      if (msg.isFirstBoot) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 10 * 1000);
      }
    };

    doIt();
    return () => {
      isFetching.current = true;
    };
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      <Navbar />

      {!isReady && <LoadingPanel status={status} />}
      {showConfetti && <Confetti />}

      {host && status.containerBooted.success && (
        <WebSocketProvider
          playgroundId={host}
          onReconnect={() => {
            console.log("Websocket reconnected");
            toast({
              description: "Websocket connection re-established",
            });
          }}
          onConnected={() => {
            if (!status.ws.loading) return;
            setStatus("ws", () => ({
              loading: false,
              success: true,
            }));
          }}
          onFailure={() => {
            if (!status.ws.loading) return;

            setStatus("ws", () => ({
              loading: false,
              success: false,
            }));
          }}
        >
          <Layout
            pgId={host}
            editor={
              <Editor
                onReady={() => {
                  console.log("**editor on_ready**");
                  setStatus("editor", () => ({
                    loading: false,
                    success: true,
                  }));
                }}
                onError={() => {
                  console.log("**editor on_error**");
                  setStatus("editor", () => ({
                    loading: false,
                    success: false,
                  }));
                }}
              />
            }
            fileTree={
              <FileTree
                onReady={() => {
                  if (!status.fileTree.loading) return;
                  console.log("**file tree on_ready**");
                  setStatus("fileTree", () => ({
                    loading: false,
                    success: true,
                  }));
                }}
              />
            }
            terminal={
              <TerminalX
                dimensions={dimensions}
                terminal={terminal}
                fitTerm={fitTerm}
                forceFit={forceFit}
                onReady={() => {
                  console.log("** terminal on_ready**");
                  setStatus("terminal", () => ({
                    loading: false,
                    success: true,
                  }));
                }}
              />
            }
            preview={<Browser containerUrl={getSubDomain(host)} />}
            onLayout={() => {
              fitTerm();
            }}
          />
        </WebSocketProvider>
      )}
    </div>
  );
}
