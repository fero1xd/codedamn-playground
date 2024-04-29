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

export const Route = createFileRoute("/playground/$pgId")({
  component: Playground,
});

function Playground() {
  const { pgId } = Route.useParams();
  const { dimensions, fitTerm, terminal, forceFit } = useTerminal();
  const [selectedFile, setSelectedFile] = useState<string>();

  const { isReady, status, setStatus } = usePgLoading();

  const isFetching = useRef(false);
  const [host, setHost] = useState<string>();

  useEffect(() => {
    const doIt = async () => {
      if (isFetching.current) return;

      const res = await fetch(
        "http://localhost:3000/playgrounds/boot/" + pgId,
        {
          method: "POST",
        }
      );

      setTimeout(() => {
        setStatus("sentContainerReq", () => ({
          loading: false,
          success: res.ok,
        }));

        setStatus("containerBooted", () => ({
          loading: false,
          success: res.ok,
        }));
      }, 1500);

      if (!res.ok) {
        console.log("not good response");
      }

      const msg = (await res.json()) as { host: string };
      setHost(msg.host);
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

      {host && status.containerBooted.success && (
        <WebSocketProvider playgroundId={host}>
          <Layout
            editor={
              <Editor
                setSelectedFile={setSelectedFile}
                selectedFile={selectedFile}
                onReady={() => {
                  console.log("**editor on_ready**");
                  setStatus("editor", () => ({
                    loading: false,
                    success: true,
                  }));
                }}
              />
            }
            fileTree={
              <FileTree
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onReady={() => {
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
            preview={<Browser containerUrl={`http://${host}.localhost`} />}
            onLayout={() => {
              fitTerm();
            }}
          />
        </WebSocketProvider>
      )}
    </div>
  );
}
