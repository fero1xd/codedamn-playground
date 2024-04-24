import { Monaco } from '@monaco-editor/react';
import { Editor } from '../../types';
import { configureFormatting } from './format';

export function configureHtml(_editor: Editor, monaco: Monaco) {
  configureFormatting(monaco);
}
