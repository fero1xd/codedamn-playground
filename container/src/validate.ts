import { z } from 'zod';
import { IncomingMessage } from './types';

const baseMessage = z.object({
  nonce: z.string(),
});

export const incomingMessage = z.discriminatedUnion('event', [
  baseMessage.extend({
    event: z.literal(IncomingMessage.GENERATE_ROOT_TREE),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.GENERATE_TREE),
    path: z.string(),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.FILE_CONTENT),
    filePath: z.string(),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.SAVE_CHANGES),
    filePath: z.string(),
    changes: z.string(),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.TERMINAL_SESSION_START),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.TERMINAL_USER_CMD),
    cmd: z.string(),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.RESIZE_TERMINAL),
    data: z.object({ cols: z.number(), rows: z.number() }),
  }),
]);

export type IncomingMessageType = z.infer<typeof incomingMessage>;
