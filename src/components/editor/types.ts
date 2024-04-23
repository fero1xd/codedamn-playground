import * as monaco from 'monaco-editor';
import { hasUrlImportsOrExports, isBare, safeName } from './utils/imports';

export type Editor = monaco.editor.IStandaloneCodeEditor;
export type TextModel = monaco.editor.ITextModel;
export type ViewState = monaco.editor.ICodeEditorViewState;

export interface Types {
  [key: string]: string;
}

export const typesService = {
  getTypeUrls: async (types: string[]) => {
    const fetchedTypes: Types = {};

    for (const type of types) {
      const mod = removeSpecifier(removeCDNPrefix(type));
      if (!isBare(mod)) continue;
      try {
        console.log('loading type url for ' + type);
        const res = await fetch('https://esm.sh/' + mod);
        if (!res.ok) continue;
        const typesUrl = res.headers.get('X-Typescript-Types');
        if (!typesUrl) continue;
        fetchedTypes[type] = typesUrl;
      } catch {
        // ignore
      }
    }

    return fetchedTypes;
  },
};

const removeCDNPrefix = (url: string) => {
  if (!url.startsWith('https://')) return url;

  const prefixes = [
    'https://esm.sh/',
    'https://cdn.skypack.dev/',
    'https://cdn.jsdelivr.net/npm/',
    'https://fastly.jsdelivr.net/npm/',
    'https://esm.run/',
    'https://esbuild.vercel.app/',
    'https://bundle.run/',
    'https://unpkg.com/',
    'https://deno.bundlejs.com/?file&q=',
    'https://jspm.dev/',
  ];

  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) {
      return url.replace(prefix, '');
    }
  }
  return url;
};

const removeSpecifier = (type: string) =>
  type.includes(':') && !type.startsWith('data:') && !type.startsWith('http')
    ? type.split(':')[1]
    : type;

let loadedTypes: Record<string, string> = {};

export const loadTypes = async (types: Record<string, string>) => {
  const keys = Object.keys(types);
  const res = [];
  for (const key of keys) {
    res.push(await loadTypeContents({ [key]: types[key] }));
  }

  return res;
};

export const loadTypeContents = async (type: Record<string, string>) => {
  let content = '';
  const name = Object.keys(type)[0];
  const value = Object.values(type)[0];

  const url = value;

  if (loadedTypes[name]) {
    return { filename: '', content: '' };
  }
  if (url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed fetching: ' + url);
      let dts = await res.text();

      if (hasUrlImportsOrExports(dts)) {
        console.log('hasUrlImportsOrExports');
        const dtsBundleModule: typeof import('./utils/bundle-types') =
          await import('./utils/bundle-types');

        dts = await dtsBundleModule.bundle({ name, main: url });
      }

      const declareAsModule = !dts.includes('declare module');
      const declareAsGlobal = false;

      content =
        declareAsModule && !declareAsGlobal
          ? `declare module '${name}' {${dts}}`
          : dts;
    } catch {
      content = `declare module '${name}': any`;
    }
  }
  // remove empty entries
  const prevTypes = Object.keys(loadedTypes)
    .filter((k) => loadedTypes[k] !== '')
    .reduce(
      (acc, k) => ({
        ...acc,
        [k]: loadedTypes[k],
      }),
      {}
    );
  if (content.trim() === '') {
    loadedTypes = prevTypes;
    return { filename: '', content: '' };
  }
  loadedTypes = { ...prevTypes, ...type };
  const lib = {
    filename: `file:///node_modules/${safeName(name)}/index.d.ts`,
    content,
  };
  return lib;
};
