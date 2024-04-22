import { Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import typescriptPlugin from 'prettier/plugins/typescript';
import * as prettierPluginEstree from 'prettier/plugins/estree';

export function configureFormatting(monaco: Monaco) {
  monaco.languages.registerDocumentFormattingEditProvider('typescript', {
    async provideDocumentFormattingEdits(model) {
      console.log('formatting ts code');
      const text = await prettier.format(model.getValue(), {
        plugins: [prettierPluginEstree, typescriptPlugin],
        parser: 'typescript',
        useTabs: true,
        trailingComma: 'all',
        printWidth: 100,
      });

      return [
        {
          range: model.getFullModelRange(),
          text,
        },
      ];
    },
  });
}
