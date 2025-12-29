  import { hc } from "hono/client";
  import app from "./routes";  // 値としてインポート

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = hc<typeof app>("");
  export type Client = typeof client;

  export const hcWithType = (...args: Parameters<typeof hc>): Client =>
    hc<typeof app>(...args);