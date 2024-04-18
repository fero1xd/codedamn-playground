import { Monaco, Editor as MonacoEditor } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useMaterial } from './editor/use-material';
import * as prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';

export function Editor() {
  const { themeLoaded } = useMaterial();

  const onMount = async (e: monaco.editor.IStandaloneCodeEditor, m: Monaco) => {
    // Typescript settings
    const compilerOptions = {
      allowjs: true,
      allowsyntheticdefaultimports: true,
      alwaysstrict: true,
      noemit: true,
      typeRoots: ['node_modules/@types'],
    };

    m.languages.typescript.typescriptDefaults.setCompilerOptions(
      compilerOptions
    );
    m.languages.typescript.javascriptDefaults.setCompilerOptions(
      compilerOptions
    );

    m.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    m.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    m.languages.registerDocumentFormattingEditProvider('typescript', {
      async provideDocumentFormattingEdits(model) {
        console.log(model.getValue());

        const text = await prettier.format(model.getValue(), {
          parser: 'babel-ts',
          plugins: [parserBabel, prettierPluginEstree],
          singleQuote: true,
        });

        return [
          {
            range: model.getFullModelRange(),
            text,
          },
        ];
      },
    });

    // @ts-expect-error Again, weird type errors
    e.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
      console.log('formatting code');
      e.getAction('editor.action.formatDocument')?.run();
    });

    m.editor.getModels().forEach((m) => m.dispose());

    const model = m.editor.createModel(
      'import {a} from                          "./sec"',
      'typescript',
      m.Uri.parse('file:///main.ts')
    );

    m.editor.createModel(
      'export const a = 5',
      'typescript',
      m.Uri.parse('file:///sec.ts')
    );

    // @ts-expect-error aaaa
    e.setModel(model);
  };

  if (!themeLoaded) {
    return (
      <div className='h-full w-full flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  return (
    <MonacoEditor
      height='100%'
      defaultLanguage='javascript'
      defaultValue='// some comment'
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 18,
      }}
      theme='uitheme'
      onMount={onMount}
    />
  );
}
