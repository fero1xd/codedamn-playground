import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { autoClose } from './autoclose';
import { configureFormatting } from './format';

export function configureHtml(editor: Editor, monaco: Monaco) {
  autoClose(editor);
  configureFormatting(monaco);
}
