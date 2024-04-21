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
]);

export type IncomingMessageType = z.infer<typeof incomingMessage>;
