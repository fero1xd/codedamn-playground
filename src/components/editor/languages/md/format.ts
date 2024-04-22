import { Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import mdPlugin from 'prettier/plugins/markdown';

export function configureFormatting(monaco: Monaco) {
  monaco.languages.registerDocumentFormattingEditProvider('markdown', {
    async provideDocumentFormattingEdits(model) {
      console.log('md formatting with prettier');

      const text = await prettier.format(model.getValue(), {
        plugins: [mdPlugin],
        parser: 'markdown',
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
