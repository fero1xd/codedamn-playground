import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from './layout';
import { Editor } from './components/editor';
import { TerminalX } from './components/terminal';
import { useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';

export function App() {
  useDarkMode();

  const [fitAddon] = useState(() => new FitAddon());

  return (
    <Layout
      editor={<Editor />}
      fileTree={<></>}
      terminal={<TerminalX fit={fitAddon} />}
      preview={
        <>
          {/* <iframe
            id='twitch-chat-embed'
            src={`https://www.twitch.tv/embed/shanks_ttv/chat?parent=${window.location.hostname}&darkpopout`}
            className='h-full w-full'
          ></iframe> */}
        </>
      }
      onLayout={() => {
        console.log('layout change');
        fitAddon.fit();
      }}
    />
  );
}
