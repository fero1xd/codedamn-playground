import fs, { writeFile } from "fs/promises";
import path from "path";
import type { Dependencies, Root } from "./types";
import chokidar from "chokidar";
import { env } from "./env";
import _ from "lodash";
import { glob } from "glob";

class FsService {
  async watchForDepsChange(cb: (types: Dependencies) => void) {
    // Will ensure that home directory is always present
    const workDir = await this.getWorkDir();

    const watcher = chokidar.watch(path.join(workDir, "**/package.json"), {
      ignoreInitial: true,
    });
    console.log("watching for deps change");

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
    cb: (
      event: "change" | "add" | "addDir" | "unlink" | "unlinkDir",
      p: string
    ) => void
  ) {
    const workDir = await this.getWorkDir();
    const watcher = chokidar.watch(workDir, {
      ignoreInitial: true,
      // Ignore all dot files/folders and everything *inside* node_modules folder
      ignored: (p) => {
        if (/(^|[\/\\])\../.test(p)) return true;

        if (p === path.join(workDir, "node_modules")) {
          return false;
        }
        if (path.basename(p) === "node_modules") {
          return false;
        }

        return p.startsWith(path.join(workDir, "node_modules"));
      },
    });

    watcher.on("all", (event, path) => {
      // if (event === "change") return;

      cb(event, path);
    });
  }

  async readPackageJsonDeps() {
    const deps = new Set<string>();

    try {
      const workDir = await this.getWorkDir();

      const depsFile = await glob(path.join(workDir, "**/package.json"));
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
      const c = await fs.readFile(filePath, { encoding: "utf-8" });

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
    } catch (e) {
      console.log("erro while saving file");
      console.log(e);
    }
  }

  // Using this for adding models
  async getAllProjectFiles(dirPath: string) {
    try {
      const tsFiles = await glob(dirPath + "/**/*.*", {
        ignore: [path.join(dirPath, "**/node_modules/**")],
      });

      return tsFiles;
    } catch (e) {
      console.log("error getting all project files");
      console.log(e);
    }
  }
}

export const fsService = new FsService();
