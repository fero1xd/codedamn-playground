import { varchar, pgEnum, serial, pgTable } from 'drizzle-orm/pg-core';

export const templateEnum = pgEnum('template', ['nodejs']);

export const playgrounds = pgTable('playgrounds', {
  id: serial('id').primaryKey(),
  template: templateEnum('template'),
  name: varchar('name', { length: 256 }),
});
