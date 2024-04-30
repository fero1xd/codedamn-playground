const REQUIRED_ENV = [
  "WORK_DIR",
  "TEMPLATE",
  "DEPS_FILE",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "VIRTUAL_HOST1",
  "VIRTUAL_HOST2",
  "VIRTUAL_HOST3",
] as const;

type Env = { [X in (typeof REQUIRED_ENV)[number]]: string };

const makeEnv = () => {
  const rawEnv = process.env;
  const env: Partial<Env> = {};

  for (const key of REQUIRED_ENV) {
    if (rawEnv[key] === undefined) {
      console.log(`Forgot to pass environment variable: ${key}`);
      process.exit(1);
    }

    env[key] = rawEnv[key];
  }

  return env as Env;
};

export const env = makeEnv();
