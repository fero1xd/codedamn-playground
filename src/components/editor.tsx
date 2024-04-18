import { Editor as MonacoEditor, loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

export function Editor() {
  const [isThemeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loader.init().then((m) => {
      fetch('/theme.json')
        .then((d) => d.json())
        .then((theme) => {
          m.editor.defineTheme('uitheme', theme);
          setThemeLoaded(true);
        });
    });
  }, []);

  if (!isThemeLoaded) return <>Loading...</>;

  return (
    <MonacoEditor
      height='100%'
      defaultLanguage='typescript'
      defaultValue='// some comment'
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 18,
      }}
      theme={'uitheme'}
    />
  );
}
