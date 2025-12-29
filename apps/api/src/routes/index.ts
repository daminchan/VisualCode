import { OpenAPIHono } from "@hono/zod-openapi";
  import { swaggerUI } from "@hono/swagger-ui";
  import { cors } from "hono/cors";
  import { healthRoute } from "../schemas/health";

  // 1. ベースのアプリ作成
  const baseApp = new OpenAPIHono();

  // 2. ミドルウェアは別で適用
  baseApp.use("/*", cors({
    origin: ["http://localhost:3000"],
  }));

  // 3. ルートをチェーンして app に
  const app = baseApp
    .openapi(healthRoute, (c) => {
      return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    })
    .doc("/openapi.json", {
      openapi: "3.0.0",
      info: {
        title: "Visual Code Notebook API",
        version: "1.0.0",
      },
    })
    .get("/docs", swaggerUI({ url: "/openapi.json" }));

  // 4. app をエクスポート（型情報あり）
  export type AppType = typeof app;
  export default app;



