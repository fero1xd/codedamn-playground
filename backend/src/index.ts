import { serve } from '@hono/node-server';
import { seedTemplates } from './aws';
import { Hono } from 'hono';

const main = async () => {
  await seedTemplates();
  const app = new Hono();

  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });

  const port = 3000;
  console.log(`Server is running on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
};

main();
