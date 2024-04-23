import { removeComments } from './comments';

export const importsPattern =
  /(import\s+?(?:(?:(?:[\w*\s{},\$]*)\s+from\s+?)|))((?:".*?")|(?:'.*?'))([\s]*?(?:;|$|))/g;

export const dynamicImportsPattern =
  /(import\s*?\(\s*?((?:".*?")|(?:'.*?'))\s*?\))/g;

export const getImports = (code: string, removeSpecifier = false) =>
  [
    ...[...removeComments(code).matchAll(new RegExp(importsPattern))],
    ...[...removeComments(code).matchAll(new RegExp(dynamicImportsPattern))],
  ]
    .map((arr) => arr[2].replace(/"/g, '').replace(/'/g, ''))
    .map((mod) => {
      if (!removeSpecifier || !isBare(mod) || !mod.includes(':')) {
        return mod;
      }
      return mod.split(':')[1];
    });

export const isBare = /* @__PURE__ */ (mod: string) =>
  !mod.startsWith('https://') &&
  !mod.startsWith('http://') &&
  !mod.startsWith('.') &&
  !mod.startsWith('/') &&
  !mod.startsWith('data:') &&
  !mod.startsWith('blob:');

export const hasUrlImportsOrExports = (code: string) =>
  new RegExp(
    /((?:import|export)\s+?(?:(?:(?:[\w*\s{},\$]*)\s+from\s+?)|))((?:"(?:\.|http|\/).*?")|(?:'(?:\.|http|\/).*?'))([\s]*?(?:;|$|))/
  ).test(removeComments(code));

export const safeName = (name: string, symbol = '_') =>
  name.replace(/[\W]+/g, symbol);
