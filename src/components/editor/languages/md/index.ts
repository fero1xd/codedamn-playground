import { Monaco } from '@monaco-editor/react';
import { configureFormatting } from './format';

export function configureMd(m: Monaco) {
  configureFormatting(m);
}
