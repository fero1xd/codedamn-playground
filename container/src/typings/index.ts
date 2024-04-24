import { Dependencies, PackageJSON } from '../types';
import { env } from '../env';
import path from 'path';
import { exists } from '../fs';
import { readFile } from 'fs/promises';
import * as dts from 'dts-bundle';

export const bundleTypeDefs = async (deps: Dependencies) => {
  const workDir = env.WORK_DIR;
  const nodeModulesPath = path.join(workDir, 'node_modules');

  if (!(await exists(nodeModulesPath))) {
    return console.log('node modules doesnt exist');
  }

  const allDeps = [
    ...Object.keys(deps.dependencies),
    ...Object.keys(deps.devDependencies),
  ];
  for (const dep of allDeps) {
    try {
      console.log('bundling type def for ' + dep);
      const packagePath = path.join(nodeModulesPath, dep);

      const packageJsonForDep = path.join(packagePath, 'package.json');
      const packageJson = JSON.parse(
        await readFile(packageJsonForDep, {
          encoding: 'utf-8',
        })
      ) as PackageJSON;

      // Check if there is a entry point for types
      if (packageJson.typings || packageJson.types) {
        const entryPoint = path.join(
          packagePath,
          (packageJson.typings || packageJson.types) as string
        );

        console.log(`found entry point ${entryPoint}`);

        dts.bundle({
          name: `${dep}__types__`,
          main: entryPoint,
          out: '/home/pranjal/deps.d.ts',
        });
      }
    } catch (err) {
      console.log('error while bundling type defs for package ' + dep);
      console.log(err);
    }
  }
};

bundleTypeDefs({
  dependencies: {
    zod: '___',
  },
  devDependencies: {},
});
