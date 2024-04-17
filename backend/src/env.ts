const REQUIRED_ENV = ['BUCKET', 'REGION', 'ACCESS_KEY', 'SECRET_KEY'] as const;

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
