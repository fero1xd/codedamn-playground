export const env = (() => {
  const ENV_VARS = [
    "WORK_DIR",
    "TEMPLATE",
    "DEPS_FILE",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ];

  for (const v of ENV_VARS) {
    if (!process.env[v]) {
      throw new Error(`${v} is not specified in env`);
    }
  }

  return {
    WORK_DIR: process.env.WORK_DIR!,
    TEMPLATE: process.env.TEMPLATE! as "typescript" | "reactypescript",
    DEPS_FILE: process.env.DEPS_FILE!,
  };
})();
