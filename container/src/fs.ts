import fs from "fs/promises";
import path from "path";
import type { Dependencies, Root } from "./types";
import { env } from "./env";
import { watchFile } from "fs";
import { bundleTypeDefs } from "./typings";

export const watchForDepsChange = (
  path: string,
  cb: (types: Record<string, string>) => void
) => {
  // Will ensure that home directory is always present
  getWorkDir();

  watchFile(path, async () => {
    try {
      const bundledTypes = await readAndBundleTypes();
      cb(bundledTypes);
    } catch (e) {
      console.log("IO error watching file");
      console.log(e);
    }
  });

  console.log("watching file");
};

export const readAndBundleTypes = async () => {
  try {
    const workDir = await getWorkDir();
    const packagePath = path.join(workDir, "package.json");

    const file = await fs.readFile(packagePath, { encoding: "utf-8" });
    const json = JSON.parse(file) as Partial<Dependencies>;

    const bundledTypes = await bundleTypeDefs({
      dependencies: json.dependencies || {},
      devDependencies: json.devDependencies || {},
    });

    return bundledTypes || {};
  } catch (e) {
    console.log("error while reading dep file");
    console.log(e);
    return {};
  }
};

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

  try {
    const c = await fs.readFile(filePath, { encoding: "utf-8" });
    lruCache.set(filePath, c);
    return c;
  } catch (e) {
    console.log("error while fetching content for a file");
    console.log(e);
  }
};

export const createDirIfNotExists = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch (_) {
    await fs.mkdir(env.WORK_DIR, { recursive: true });
  }
};

export async function exists(f: string) {
  try {
    await fs.stat(f);
    return true;
  } catch {
    return false;
  }
}

export const getWorkDir = async () => {
  const p = env.WORK_DIR;

  await createDirIfNotExists(p);
  return p;
};
