import { useDarkMode } from '@/hooks/use-dark-mode';
import { Layout } from '@/layout';

export function App() {
  useDarkMode();

  return (
    <Layout editor={<></>} fileTree={<></>} terminal={<></>} preview={<></>} />
  );
}
