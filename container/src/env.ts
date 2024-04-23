export const env = (() => {
  if (!process.env.WORK_DIR) {
    throw new Error('WORK_DIR is not specified in env');
  }

  return {
    WORK_DIR: process.env.WORK_DIR,
    TEMPLATE: process.env.TEMPLATE!,
    DEPS_FILE: process.env.DEPS_FILE!,
  };
})();
