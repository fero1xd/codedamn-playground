import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from './layout';
import { Editor } from './components/editor';
import { FileTree } from './components/file-tree';
import { useState } from 'react';
import { Child } from './queries/types';

export function App() {
  useDarkMode();

  // useTerminal()

  const [selectedFile, setSelectedFile] = useState<Child>();

  return (
    <Layout
      editor={
        <Editor selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      }
      fileTree={
        <FileTree
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      }
      terminal={
        // <TerminalX
        //   dimensions={dimensions}
        //   terminal={terminal}
        //   fitTerm={fitTerm}
        // />
        <></>
      }
      preview={<></>}
      // onLayout={fitTerm}
      onLayout={() => {}}
    />
  );
}
