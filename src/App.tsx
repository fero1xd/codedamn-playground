import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from './layout';
import { Editor } from './components/editor';
import { FileTree } from './components/file-tree';

export function App() {
  useDarkMode();

  return (
    <Layout
      editor={<Editor />}
      fileTree={<FileTree />}
      terminal={<></>}
      preview={
        <>
          {/* <iframe
            id='twitch-chat-embed'
            src={`https://www.twitch.tv/embed/shanks_ttv/chat?parent=${window.location.hostname}&darkpopout`}
            className='h-full w-full'
          ></iframe> */}
        </>
      }
    />
  );
}
