import fs from 'fs/promises';
import path from 'path';
import util from 'util';
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
      if (c.isFile()) {
        node.children.push({ name: c.name, isDir: false, children: [] });
        continue;
      }

      const t: Child = { name: c.name, isDir: true, children: [] };
      await traverseFs(path.resolve(dirName, c.name), t);
      node.children.push(t);
    }
  };

  await traverseFs(workDir, root);

  console.log(util.inspect(root, { depth: null, colors: true }));

  return root;
};
