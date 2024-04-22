import { Monaco } from '@monaco-editor/react';

export function configureJson(m: Monaco) {
  // Disable error for comments
  m.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    comments: 'ignore',
    trailingCommas: 'error',
  });
}
