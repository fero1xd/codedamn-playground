import { z } from "zod";
import { IncomingMessage } from "./types";

const baseMessage = z.object({
  nonce: z.string(),
});

export const incomingMessage = z.discriminatedUnion("event", [
  baseMessage.extend({
    event: z.literal(IncomingMessage.GENERATE_TREE),
    data: z.object({ path: z.string().optional() }).optional(),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.FILE_CONTENT),
    data: z.object({ filePath: z.string() }),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.GET_PROJECT_FILES),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.SAVE_CHANGES),
    data: z.object({ filePath: z.string(), newContent: z.string() }),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.TERMINAL_SESSION_START),
    data: z.object({ prevSessionId: z.string().optional() }),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.TERMINAL_USER_CMD),
    data: z.object({ cmd: z.string(), sessionId: z.string() }),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.GET_TYPINGS),
    data: z.object({ package: z.string() }),
  }),
  baseMessage.extend({
    event: z.literal(IncomingMessage.RESIZE_TERMINAL),
    data: z.object({
      cols: z.number(),
      rows: z.number(),
      sessionId: z.string(),
    }),
  }),
]);

export type IncomingMessageType = z.infer<typeof incomingMessage>;
