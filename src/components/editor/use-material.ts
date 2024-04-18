import { loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

export function useMaterial() {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loader.init().then(async (m) => {
      // Load theme here
      console.log('fetching theme');
      const res = await fetch('/theme.json');
      const json = await res.json();
      m.editor.defineTheme('uitheme', json);
      m.editor.setTheme('uitheme');

      setThemeLoaded(true);
    });
  }, [themeLoaded]);

  return { themeLoaded };
}
