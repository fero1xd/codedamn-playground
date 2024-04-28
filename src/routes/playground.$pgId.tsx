import { Editor } from "@/components/editor";
import { createFileRoute } from "@tanstack/react-router";
import { FileTree } from "@/components/file-tree";
import { useTerminal } from "@/hooks/use-terminal";
import { useState } from "react";
import { TerminalX } from "@/components/terminal";
import { Browser } from "@/components/browser";
import { Layout } from "@/layout";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/playground/$pgId")({
  component: Playground,
});

function Playground() {
  const { pgId: _ } = Route.useParams();

  const { dimensions, fitTerm, terminal, forceFit } = useTerminal();

  const [selectedFile, setSelectedFile] = useState<string>();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <Layout
        editor={
          <Editor
            setSelectedFile={setSelectedFile}
            selectedFile={selectedFile}
          />
        }
        fileTree={
          <FileTree
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        }
        terminal={
          <TerminalX
            dimensions={dimensions}
            terminal={terminal}
            fitTerm={fitTerm}
            forceFit={forceFit}
          />
        }
        preview={<Browser containerUrl="https://youtube.com" />}
        onLayout={() => {
          console.log("on layouts");
          fitTerm();
        }}
      />
    </div>
  );
}
