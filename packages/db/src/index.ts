import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Turso クライアント作成
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle インスタンス（スキーマ付き）
export const db = drizzle(client, { schema });

// スキーマを再エクスポート
export * from "./schema";

// 型エクスポート
export type Database = typeof db;
