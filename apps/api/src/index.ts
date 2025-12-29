import { serve } from "@hono/node-server";
import app from "./routes";

const port = Number(process.env.PORT) || 3001;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

// RPC用に型をエクスポート
export type { AppType } from "./routes";
