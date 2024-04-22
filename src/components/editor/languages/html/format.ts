import { Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';

export function configureFormatting(monaco: Monaco) {
  monaco.languages.html.htmlDefaults.setModeConfiguration({
    ...monaco.languages.html.htmlDefaults.modeConfiguration,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
  });

  monaco.languages.registerDocumentFormattingEditProvider('html', {
    async provideDocumentFormattingEdits(model) {
      console.log('html formatting with prettier');

      const text = await prettier.format(model.getValue(), {
        plugins: [htmlPlugin],
        parser: 'html',
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
