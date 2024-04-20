import 'dotenv/config';
import { createWSS } from './wss';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { mainRoutes } from './routes';
import { seedTemplates } from './aws';
import { doRatelimit } from './middlewares/ratelimit';

const main = async () => {
  await seedTemplates();
  const app = new Hono();

  // Rate limiting
  app.use(doRatelimit());

  app.get('/health', (c) => c.text('functional'));

  app.route('/playgrounds', mainRoutes);

  const port = 3000;
  console.log(`Server is running on port ${port}`);

  createWSS();

  serve({
    fetch: app.fetch,
    port,
  });
};

main();
