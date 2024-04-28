import { Hono } from "hono";
import { createPlayground } from "./create";
import { bootupPlayground } from "./boot";
import { getAllPlaygrounds } from "./get";

export const mainRoutes = new Hono();

mainRoutes.get("/", getAllPlaygrounds);
mainRoutes.post("/create", createPlayground);
mainRoutes.post("/boot/:id", bootupPlayground);
