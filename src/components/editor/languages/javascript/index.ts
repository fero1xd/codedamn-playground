import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { configureFormatting } from './format';

export function configureJs(_e: Editor, m: Monaco) {
  configureFormatting(m);

  m.languages.typescript.javascriptDefaults.setEagerModelSync(true);

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

  m.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
  m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}
