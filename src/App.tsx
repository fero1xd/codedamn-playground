import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from './layout';
import { Editor } from './components/editor';
import { TerminalX } from './components/terminal';
import { useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Browser } from './components/browser';

export function App() {
  useDarkMode();

  // TODO: Refactor this
  const [fitAddon] = useState(() => new FitAddon());

  return (
    <Layout
      editor={<Editor />}
      fileTree={<></>}
      terminal={<></>}
      preview={<Browser />}
      onLayout={() => {
        console.log('layout change');
        fitAddon.fit();
      }}
    />
  );
}
