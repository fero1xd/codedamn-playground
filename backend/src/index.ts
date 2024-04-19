import 'dotenv/config';
import { createWSS } from './wss';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createPlayground } from './db/queries';
import { PlaygroundInsert } from './db/types';
import { DrizzleError } from 'drizzle-orm';
import { copyS3Folder, seedTemplates } from './aws';

const main = async () => {
  await seedTemplates();
  const app = new Hono();

  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });

  app.post('/create', async (c) => {
    // TODO: Improve this later, use drizzle-zod
    const data = (await c.req.json()) as Partial<{
      name: string;
      template: string;
    }>;

    if (!data.name || !data.template) {
      return c.json({ status: 400, message: 'invalid request' });
    }

    try {
      const id = await createPlayground({
        name: data.name,
        template: data.template,
      } as PlaygroundInsert);

      console.log('created playground with id ' + id);

      await copyS3Folder(`templates/${data.template}`, `${id}`);
    } catch (e) {
      if (e instanceof DrizzleError) {
        console.log('drizzle error');
      } else {
        console.log('error');
      }
      console.log(e);
    }

    console.log('created playground in db');

    return c.text('OK');
  });

  const port = 3000;
  console.log(`Server is running on port ${port}`);

  createWSS();

  serve({
    fetch: app.fetch,
    port,
  });
};

main();
