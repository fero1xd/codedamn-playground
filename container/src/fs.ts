import fs from 'fs/promises';
import path from 'path';
import { Child, Root } from './types';

export const generateFileTree = async () => {
  // Will be passed as an env variable to container
  const workDir = process.env.WORK_DIR as string;

  const root: Root = {
    children: [],
  };

  const traverseFs = async (dirName: string, node: Child | Root) => {
    const contents = await fs.readdir(dirName, { withFileTypes: true });

    for (const c of contents) {
      const p = path.join(c.path, c.name);

      if (c.isFile()) {
        node.children.push({
          name: c.name,
          isDir: false,
          children: [],
          path: p,
        });
        continue;
      }

      const t: Child = {
        name: c.name,
        isDir: true,
        children: [],
        path: p,
      };
      await traverseFs(path.resolve(dirName, c.name), t);
      node.children.push(t);
    }
  };

  await traverseFs(workDir, root);

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
