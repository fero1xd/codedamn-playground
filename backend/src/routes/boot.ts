import { Context } from "hono";
import { createPlaygroundContainer, startPlayground } from "../docker";
import { getPlayground } from "../db/queries";
import { redis } from "../upstash/ratelimit";

export async function bootupPlayground(c: Context) {
  try {
    const playgroundId = c.req.param("id");

    if (!playgroundId) {
      return c.json({ message: "no playground id given" }, 400);
    }

    const playground = await getPlayground(playgroundId);
    if (!playground) {
      return c.json({ message: "no playground found" }, 404);
    }

    const { success: createSuccess, isFirstBoot } =
      await createPlaygroundContainer(playgroundId, playground.template);

    const success = await startPlayground(playgroundId);

    if (!createSuccess && !success) {
      return c.json({ message: "unexpected error occurred" }, 500);
    }

    const slug = await redis.get(`${playground.id}_alias`);
    if (!slug) {
      console.log("no slug");
      return c.json({ message: "unexpected error occurred" }, 500);
    }

    return c.json({ message: "success", host: slug, isFirstBoot });
  } catch (err) {
    console.log("error when booting");
    console.log(err);

    return c.json({ message: "unexpected error occurred" }, 500);
  }
}
