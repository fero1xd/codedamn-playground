import { useDarkMode } from "@/hooks/use-dark-mode";
import { Layout } from "./layout";
import { Editor } from "./components/editor";
import { FileTree } from "./components/file-tree";
import { useState } from "react";
import { useTerminal } from "./hooks/use-terminal";
import { TerminalX } from "./components/terminal";
import { Toaster } from "./components/ui/toaster";
import { Browser } from "./components/browser";

export function App() {
  useDarkMode();

  const { dimensions, fitTerm, terminal } = useTerminal();

  const [selectedFile, setSelectedFile] = useState<string>();
  return (
    <>
      {/* <Loa>dingPanel /> */}
      <Toaster />
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
          />
        }
        preview={<Browser containerUrl="https://youtube.com" />}
        onLayout={fitTerm}
      />
    </>
  );
}
