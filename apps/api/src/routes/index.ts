import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { healthRoute } from "../schemas/health";

// OpenAPIHono でアプリ作成
const app = new OpenAPIHono();

// CORS設定（別で適用）
app.use("/*", cors({
  origin: ["http://localhost:3000"],
}));

// ルート定義 + ハンドラー
app.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI仕様書エンドポイント
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Visual Code Notebook API",
    version: "1.0.0",
  },
});

// Swagger UI（テスト用画面）
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// RPC用に型エクスポート
export type AppType = typeof app;
export default app;