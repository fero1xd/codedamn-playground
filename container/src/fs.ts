import fs, { writeFile } from "fs/promises";
import path from "path";
import type { Dependencies, Root } from "./types";
import chokidar from "chokidar";
import { env } from "./env";
import { watch, watchFile } from "fs";
import { bundleTypeDefs } from "./typings";
import { glob } from "glob";
import { LRUCache } from "lru-cache";

class FsService {
  private lruCache: LRUCache<{}, {}, unknown>;

  constructor() {
    this.lruCache = new LRUCache({
      max: 20,
    });
  }

  async watchForDepsChange(
    path: string,
    cb: (types: Record<string, string>) => void
  ) {
    // Will ensure that home directory is always present
    this.getWorkDir();

    watchFile(path, async () => {
      try {
        const bundledTypes = await this.readAndBundleTypes();
        cb(bundledTypes);
      } catch (e) {
        console.log("IO error watching file");
        console.log(e);
      }
    });

    console.log("watching file");
  }

  async watchWorkDir(
    cb: (event: "add" | "addDir" | "unlink" | "unlinkDir", p: string) => void
  ) {
    const workDir = await this.getWorkDir();
    const watcher = chokidar.watch(workDir, {
      ignoreInitial: true,
    });

    watcher.on("all", (event, path) => {
      if (event === "change") return;

      cb(event, path);
    });
  }

  async readAndBundleTypes() {
    try {
      const workDir = await this.getWorkDir();
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
  }

  async generateFileTree(dirName: string) {
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
  }

  async getFileContent(filePath: string) {
    if (this.lruCache.has(filePath)) {
      return this.lruCache.get(filePath) as string;
    }

    try {
      const c = await fs.readFile(filePath, { encoding: "utf-8" });
      this.lruCache.set(filePath, c);

      return c;
    } catch (e) {
      console.log("error while fetching content for a file");
      console.log(e);
    }
  }

  async createDirIfNotExists(dirPath: string) {
    try {
      await fs.access(dirPath);
    } catch (_) {
      await fs.mkdir(env.WORK_DIR, { recursive: true });
    }
  }

  async exists(f: string) {
    try {
      await fs.stat(f);
      return true;
    } catch {
      return false;
    }
  }

  async getWorkDir() {
    const p = env.WORK_DIR;

    await this.createDirIfNotExists(p);
    return p;
  }

  // Sanitize path here dont let users write anywhere in the container
  async saveFile(filePath: string, contents: string) {
    if (!(await this.exists(filePath))) {
      return;
    }

    await writeFile(filePath, contents, { encoding: "utf-8" });

    this.lruCache.set(filePath, contents);
  }

  async getAllProjectFiles(dirPath: string) {
    const extension = env.TEMPLATE === "typescript" ? ".ts" : ".tsx";

    const tsFiles = await glob(dirPath + "/**/*" + extension, {
      ignore: dirPath + "/node_modules/**",
    });

    const getFieldContent = this.getFileContent.bind(this);

    return {
      [Symbol.asyncIterator]: async function* () {
        for (const file of tsFiles) {
          const contents = await getFieldContent(file);
          yield { name: file, contents };
        }
      },
    };
  }
}

export const fsService = new FsService();
