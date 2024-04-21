import fs from 'fs/promises';
import path from 'path';
import { Root } from './types';

export const generateFileTree = async (dirName: string) => {
  const contents = await fs.readdir(dirName, { withFileTypes: true });

  const sortedContents = contents.sort(
    (a, b) => (a.isDirectory() ? 0 : 1) - (b.isDirectory() ? 0 : 1)
  );

  const root: Root = {
    path: dirName,
    children: [],
  };

  for (const c of sortedContents) {
    const p = path.join(c.path, c.name);

    root.children.push({
      isDir: c.isDirectory(),
      path: p,
      name: c.name,
      children: [],
    });
  }

  return root;
};

const lruCache: Map<string, string> = new Map();

export const getFileContent = async (filePath: string) => {
  if (lruCache.has(filePath)) {
    const contents = lruCache.get(filePath)!;

    lruCache.delete(filePath);
    lruCache.set(filePath, contents);

    return contents;
  }

  if (lruCache.size > 10) {
    lruCache.delete(lruCache.keys().next().value);
  }

  const c = await fs.readFile(filePath, { encoding: 'utf-8' });
  lruCache.set(filePath, c);

  return c;
};
