import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { configureFormatting } from './format';

export function configureHtml(editor: Editor, monaco: Monaco) {
  configureFormatting(monaco);
}
