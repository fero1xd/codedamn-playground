import { eq } from 'drizzle-orm';
import { db } from '.';
import { playgrounds } from './schema';
import { PlaygroundInsert } from './types';

export const getAllPlaygrounds = async () => {
  return await db.query.playgrounds.findMany();
};

export const getPlayground = async (id: string) => {
  return await db.query.playgrounds.findFirst({
    where: eq(playgrounds.id, id),
  });
};

export const createPlayground = async (data: PlaygroundInsert) => {
  const a = await db
    .insert(playgrounds)
    .values(data)
    .returning({ insertedId: playgrounds.id });

  return a[0].insertedId;
};
