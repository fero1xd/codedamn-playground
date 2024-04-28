import { Context, Next } from "hono";
import { identifier, ratelimit } from "../upstash/ratelimit";

export function doRatelimit() {
  return async function (c: Context, next: Next) {
    if (process.env.DEVELOPMENT) {
      return await next();
    }
    if (!c.req.path.startsWith("/playgrounds/create")) {
      return await next();
    }

    console.log("rate limiting");

    const { success, reset } = await ratelimit.limit(identifier);

    if (!success) {
      return c.json(
        {
          status: 429,
          message: `you are being rate limited, request again at ${new Date(reset).toUTCString()}`,
        },
        429
      );
    }

    await next();
  };
}
