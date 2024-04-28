import { timestamp } from "drizzle-orm/pg-core";
import { varchar, pgEnum, uuid, pgTable } from "drizzle-orm/pg-core";

export const templateEnum = pgEnum("template", [
  "typescript",
  "reactypescript",
]);

export const playgrounds = pgTable("playgrounds", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  template: templateEnum("template").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
