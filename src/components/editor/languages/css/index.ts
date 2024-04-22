import { Monaco } from '@monaco-editor/react';
import { configureFormatting } from './format';

export function configureCss(monaco: Monaco) {
  configureFormatting(monaco);
}
