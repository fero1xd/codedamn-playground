import fs, { writeFile } from "fs/promises";
import path from "path";
import type { Dependencies, Root } from "./types";
import chokidar from "chokidar";
import { env } from "./env";
import _ from "lodash";
import { glob } from "glob";
import { LRUCache } from "lru-cache";

class FsService {
  private lruCache: LRUCache<{}, {}, unknown>;

  constructor() {
    this.lruCache = new LRUCache({
      max: 20,
    });
  }

  async watchForDepsChange(path: string, cb: (types: Dependencies) => void) {
    // Will ensure that home directory is always present
    this.getWorkDir();

    const watcher = chokidar.watch(path, { ignoreInitial: true });

    let lastSeen: Dependencies = {
      devDependencies: {},
      dependencies: {},
    };

    watcher.on("change", async (filePath) => {
      try {
        const deps = await this.readPackageJsonDeps(filePath);
        if (!deps) return;

        if (_.isEqual(lastSeen, deps)) {
          return;
        }
        lastSeen = { ...deps };
        cb(deps);
      } catch (e) {
        console.log("IO error while watching deps file");
        console.log(e);
      }
    });
  }

  async watchWorkDir(
    cb: (event: "add" | "addDir" | "unlink" | "unlinkDir", p: string) => void
  ) {
    const workDir = await this.getWorkDir();
    const watcher = chokidar.watch(workDir, {
      ignoreInitial: true,
      // ignored: [path.join(workDir, "node_modules/**"), /(^|[\/\\])\../],
      ignored: (p) => {
        if (/(^|[\/\\])\../.test(p)) return true;

        if (p === path.join(workDir, "node_modules")) {
          return false;
        }

        return p.startsWith(path.join(workDir, "node_modules"));
      },
    });

    watcher.on("all", (event, path) => {
      if (event === "change") return;

      cb(event, path);
    });
  }

  async readPackageJsonDeps(
    packagePath: string
  ): Promise<Dependencies | undefined> {
    try {
      const file = await fs.readFile(packagePath, { encoding: "utf-8" });
      const json = JSON.parse(file) as Partial<Dependencies>;

      // const bundledTypes = await bundleTypeDefs({
      //   dependencies: json.dependencies || {},
      //   devDependencies: json.devDependencies || {},
      // });

      return {
        dependencies: json.dependencies || {},
        devDependencies: json.devDependencies || {},
      };
    } catch (e) {
      console.log("error while reading dep file");
      console.log(e);
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
    try {
      if (!(await this.exists(filePath))) {
        return;
      }

      await writeFile(filePath, contents, { encoding: "utf-8" });

      this.lruCache.set(filePath, contents);
    } catch (e) {
      console.log("erro while saving file");
      console.log(e);
    }
  }

  async getAllProjectFiles(dirPath: string) {
    try {
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
    } catch (e) {
      console.log("error getting all project files");
      console.log(e);
    }
  }
}

export const fsService = new FsService();
