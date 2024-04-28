import { Dependencies, PackageJSON } from "../types";
import path from "path";
import { fsService } from "../fs";
import { readFile } from "fs/promises";
import * as dts from "dts-bundle";
import { redis } from "../upstash/redis";

export const bundleTypeDefs = async (deps: Dependencies) => {
  const workDir = await fsService.getWorkDir();
  const nodeModulesPath = path.join(workDir, "node_modules");

  if (!(await fsService.exists(nodeModulesPath))) {
    return console.log("node modules doesnt exist");
  }

  const allDeps = [
    ...Object.keys(deps.dependencies),
    ...Object.keys(deps.devDependencies),
  ];
  const typesDefs: Record<string, string> = {};

  for (const dep of allDeps) {
    try {
      console.log(`searching type def for ${dep}`);

      const packagePath = path.join(nodeModulesPath, dep);

      const packageJsonForDep = path.join(packagePath, "package.json");
      const packageJson = JSON.parse(
        await readFile(packageJsonForDep, {
          encoding: "utf-8",
        })
      ) as PackageJSON;

      // Check if there is a entry point for types
      if (packageJson.typings || packageJson.types) {
        const entryPoint = path.join(
          packagePath,
          (packageJson.typings || packageJson.types) as string
        );

        console.log(`found entry point for ${dep}`);

        const version = deps.dependencies[dep] || deps.devDependencies[dep];

        // const cachedTypes = (await redis.get(`__types__${dep}__${version}`)) as
        //   | string
        //   | null;

        // if (cachedTypes) {
        //   console.log(`${dep}@${version} is in cache`);
        //   typesDefs[dep] = cachedTypes;
        //   continue;
        // }

        const typesPath = `/tmp/types/${dep}/${version}/index.d.ts`;
        dts.bundle({
          main: entryPoint,
          out: typesPath,
          name: dep.startsWith("@types/") ? dep.replace("@types/", "") : dep,
          verbose: true,
          referenceExternals: true,
          externals: true,
        });

        // TODO: Make this in memory later
        const generated = await readFile(typesPath, { encoding: "utf-8" });
        await redis.set(`__types__${dep}__${version}`, generated);

        typesDefs[dep] = generated;
      }
      // More cases here
      else {
        console.log(`no type defs found for ${dep}`);
      }
    } catch (err) {
      console.log("error while bundling type defs for package " + dep);
      console.log(err);
    }
  }
  return typesDefs;
};
