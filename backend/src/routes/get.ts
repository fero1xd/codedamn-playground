import { Context } from "hono";
import { getAllPlaygrounds as getAllPlaygroundsQuery } from "../db/queries";

export async function getAllPlaygrounds(c: Context) {
  const playgrounds = await getAllPlaygroundsQuery();

  return c.json({ message: playgrounds });
}
