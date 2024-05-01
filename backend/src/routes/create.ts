import { Context } from "hono";
import { PlaygroundInsert, TemplateType } from "../db/types";
import { DrizzleError } from "drizzle-orm";
import { copyS3Folder } from "../aws";
import { createPlayground as createPlaygroundQuery } from "../db/queries";

export async function createPlayground(c: Context) {
  // TODO: Improve this later, use drizzle-zod
  const data = (await c.req.json()) as Partial<{
    name: string;
    template: TemplateType;
  }>;

  if (!data.name || !data.template) {
    return c.json({ message: "invalid request" }, 400);
  }

  try {
    const id = await createPlaygroundQuery({
      name: data.name,
      template: data.template,
    } as PlaygroundInsert);

    console.log("inserted playground in db with id " + id);

    await copyS3Folder(`templates/${data.template}`, `${id}`);

    // if (
    //   (await createPlaygroundContainer(id, data.template)).success === false
    // ) {
    //   return c.json({ message: "Playground creation failed" }, 500);
    // }

    return c.json({ playgroundId: id }, 200);
  } catch (e) {
    if (e instanceof DrizzleError) {
      console.log("drizzle error");
    } else {
      console.log("error");
    }
    console.log(e);
  }

  return c.json({ message: "unpexcted error occurred" }, 500);
}
