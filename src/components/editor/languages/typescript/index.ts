import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { configureFormatting } from './format';

export function configureTs(e: Editor, m: Monaco) {
  configureFormatting(m);

  m.languages.typescript.typescriptDefaults.setEagerModelSync(true);

  // Typescript settings
  const compilerOptions = {
    allowjs: true,
    allowsyntheticdefaultimports: true,
    alwaysstrict: true,
    noemit: true,
    typeRoots: ['node_modules/@types'],
    esModuleInterop: true,
    jsx: m.languages.typescript.JsxEmit.ReactJSX,
  };

  m.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
}
