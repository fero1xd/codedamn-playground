import { loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

export function useMaterial() {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs',
      },
    });

    loader.init().then(async (m) => {
      const res = await fetch('/theme.json');
      const json = await res.json();
      m.editor.defineTheme('uitheme', json);
      m.editor.setTheme('uitheme');

      setThemeLoaded(true);
    });
  }, [themeLoaded]);

  return { themeLoaded };
}
