import { Monaco } from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import cssPlugin from 'prettier/plugins/postcss';

export function configureFormatting(monaco: Monaco) {
  monaco.languages.css.cssDefaults.setModeConfiguration({
    ...monaco.languages.css.cssDefaults.modeConfiguration,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
  });

  monaco.languages.registerDocumentFormattingEditProvider('css', {
    async provideDocumentFormattingEdits(model) {
      console.log('css formatting with prettier');

      const text = await prettier.format(model.getValue(), {
        plugins: [cssPlugin],
        parser: 'css',
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
