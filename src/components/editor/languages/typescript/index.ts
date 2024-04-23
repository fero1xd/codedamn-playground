import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { configureFormatting } from './format';

export function configureTs(e: Editor, m: Monaco) {
  configureFormatting(m);

  m.languages.typescript.typescriptDefaults.setEagerModelSync(true);

  // Typescript settings
  const compilerOptions = {
    jsx: m.languages.typescript.JsxEmit.Preserve,
    jsxFactory: 'React.createElement',
    allowNonTsExtensions: true,
    allowImportingTsExtensions: true,
    allowJs: false,
    target: m.languages.typescript.ScriptTarget.Latest,
    experimentalDecorators: true,
    allowSyntheticDefaultImports: true,
    lib: ['esnext', 'dom'],
    module: m.languages.typescript.ModuleKind.ESNext,
    jsxFragmentFactory: 'React.Fragment',
  };

  m.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
  m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}
