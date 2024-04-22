import { Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';

export function configureFormatting(monaco: Monaco) {
  monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    async provideDocumentFormattingEdits(model) {
      console.log('formatting js code');
      const text = await prettier.format(model.getValue(), {
        plugins: [prettierPluginEstree, babelPlugin],
        parser: 'babel',
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
