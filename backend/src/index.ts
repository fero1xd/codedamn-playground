import { createWSS } from './wss';

const main = async () => {
  // await seedTemplatesa();
  createWSS();
  // const app = new Hono();

  // app.get('/', (c) => {
  //   return c.text('Hello Hono!');
  // });

  // app.post('/boot-up', (c) => {
  //   return c.text('Done');
  // });

  // const port = 3000;
  // console.log(`Server is running on port ${port}`);

  // createWSS();

  // serve({
  //   fetch: app.fetch,
  //   port,
  // });
};

main();
