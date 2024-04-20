import { Hono } from 'hono';
import { createPlayground } from './create';
import { bootupPlayground } from './boot';

export const mainRoutes = new Hono();

mainRoutes.post('/create', createPlayground);
mainRoutes.post('/boot/:id', bootupPlayground);
