import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from './layout';
import { Editor } from './components/editor';
import { useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Browser } from './components/browser';
import { FileTree } from './components/file-tree';

export function App() {
  useDarkMode();

  // TODO: Refactor this
  const [fitAddon] = useState(() => new FitAddon());

  return (
    <Layout
      editor={<Editor />}
      fileTree={<FileTree />}
      terminal={<></>}
      preview={<Browser />}
      onLayout={() => {
        console.log('layout change');
        fitAddon.fit();
      }}
    />
  );
}
