import { useDarkMode } from '@/hooks/use-dark-mode';
import { TerminalX as Terminal } from './components/terminal';
import { Layout } from './layout';
import { Editor } from './components/editor';

export function App() {
  useDarkMode();

  return (
    <Layout
      editor={<Editor />}
      fileTree={<></>}
      terminal={<Terminal />}
      preview={
        <>
          <iframe
            id='twitch-chat-embed'
            src={`https://www.twitch.tv/embed/ninja/chat?parent=${window.location.hostname}&darkpopout`}
            className='h-full w-full'
          ></iframe>
        </>
      }
    />
  );
}
