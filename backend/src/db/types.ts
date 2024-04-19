import { playgrounds } from './schema';

export type Playground = typeof playgrounds.$inferSelect;

export type PlaygroundInsert = typeof playgrounds.$inferInsert;

export type TemplateType = Playground['template'];
