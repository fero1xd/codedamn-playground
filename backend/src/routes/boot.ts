import { Context } from 'hono';
import { startPlayground } from '../docker';

export async function bootupPlayground(c: Context) {
  const playgroundId = c.req.param('id');

  if (!playgroundId) {
    return c.json({ message: 'no playground id given' }, 400);
  }

  const success = await startPlayground(playgroundId);

  if (success) {
    return c.json({ message: 'success' });
  }

  return c.json({ message: 'unexpected error occurred' }, 500);
}
