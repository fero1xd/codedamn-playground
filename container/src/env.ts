export const env = (() => {
  const ENV_VARS = ['WORK_DIR', 'TEMPLATE', 'DEPS_FILE'];

  for (const v of ENV_VARS) {
    if (!process.env[v]) {
      throw new Error(`${v} is not specified in env`);
    }
  }

  return {
    WORK_DIR: process.env.WORK_DIR!,
    TEMPLATE: process.env.TEMPLATE!,
    DEPS_FILE: process.env.DEPS_FILE!,
  };
})();
