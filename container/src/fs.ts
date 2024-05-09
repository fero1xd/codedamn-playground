import fs, { writeFile } from "fs/promises";
import path from "path";
import type { Dependencies, Root } from "./types";
import chokidar from "chokidar";
import { env } from "./env";
import _ from "lodash";
import { glob } from "glob";
import { minimatch } from "minimatch";

class FsService {
  async watchForDepsChange(cb: (types: Set<string>) => void) {
    // Will ensure that home directory is always present
    const workDir = await this.getWorkDir();

    const watcher = chokidar.watch(path.join(workDir, "**/package.json"), {
      ignoreInitial: true,
      ignored: ["/**/node_modules/**"],
    });
    console.log("watching for deps change");

    let lastSeen = new Set<string>();

    watcher.on("change", async (path) => {
      try {
        const deps = await this.readPackageJsonDeps(path);
        if (!deps) return;

        if (_.isEqual(lastSeen, deps)) {
          return;
        }

        lastSeen = new Set(deps);
        cb(deps);
      } catch (e) {
        console.log("IO error while watching deps file");
        console.log(e);
      }
    });
  }

  async watchWorkDir(
    cb: (
      event: "change" | "add" | "addDir" | "unlink" | "unlinkDir",
      pth: string,
      shouldFetch: boolean
    ) => void
  ) {
    const workDir = await this.getWorkDir();
    const watcher = chokidar.watch(workDir, {
      ignoreInitial: true,
      ignored: (p) => {
        if (/(^|[\/\\])\../.test(p)) return true;
        return minimatch(p, "**/node_modules/**");
      },
    });

    watcher.on("all", (event, path) => {
      cb(event, path, this._isProjectFile(path));
    });
  }

  async readPackageJsonDeps(p?: string) {
    const deps = new Set<string>();

    try {
      const workDir = await this.getWorkDir();

      const depsFile = await glob(p || path.join(workDir, "**/package.json"), {
        ignore: ["/**/node_modules/**"],
      });
      for (const depFile of depsFile) {
        const file = await this.getFileContent(depFile);
        if (!file) {
          continue;
        }

        const json = JSON.parse(file) as Partial<Dependencies>;
        for (const d of Object.keys({
          ...(json.dependencies || {}),
          ...(json.devDependencies || {}),
        })) {
          deps.add(d);
        }
      }
    } catch (e) {
      console.log("error while reading dep file");
      console.log(e);
    }

    return deps;
  }

  async generateFileTree(dirName: string) {
    try {
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
    } catch (e) {
      console.log("error generating file tree");
    }
  }

  async getFileContent(filePath: string) {
    try {
      const contents = await fs.readFile(filePath, { encoding: "utf-8" });
      // if (minimatch(filePath, "**/*(bun.lockb)")) {
      //   return {
      //     shouldLoad: false,
      //     contents: "",
      //   };
      // }

      return contents;
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
    } catch (e) {
      console.log("erro while saving file");
      console.log(e);
    }
  }

  // Using this for adding models
  async getAllProjectFiles() {
    try {
      const tsFiles = await glob(env.WORK_DIR + "/**/*(*.ts|*.json|*.js)", {
        ignore: ["/**/node_modules/**", "/**/package-lock.json"],
      });

      return tsFiles;
    } catch (e) {
      console.log("error getting all project files");
      console.log(e);
    }
  }

  private _isProjectFile(p: string) {
    return minimatch(p, path.join(env.WORK_DIR, "/**/*(*.ts|*.json|*.js)"));
  }
}

export const fsService = new FsService();
