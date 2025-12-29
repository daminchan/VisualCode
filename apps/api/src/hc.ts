import type { hc } from "hono/client";
import { hc as honoClient } from "hono/client";
import type app from "./routes";

// 型定義（ダミークライアントなしで型を取得）
type AppType = typeof app;
export type Client = ReturnType<typeof hc<AppType>>;

// 型付きhc関数
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  honoClient<AppType>(...args);