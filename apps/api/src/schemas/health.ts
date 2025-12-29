import { createRoute, z } from "@hono/zod-openapi";

  // ルート定義（OpenAPI仕様書の1エンドポイント分）
  export const healthRoute = createRoute({
    // HTTPメソッド
    method: "get",

    // パス（このAPIのURL）
    path: "/health",

    // Swagger UIに表示される説明
    summary: "ヘルスチェック",

    // レスポンス定義（ステータスコードごと）
    responses: {
      // 200 OK の場合
      200: {
        // Swagger UIに表示される説明
        description: "正常",
        content: {
          "application/json": {
            // Zodスキーマでレスポンスの型を定義
            // → 型安全 + OpenAPIドキュメント自動生成
            schema: z.object({
              status: z.string(),      // "ok" など
              timestamp: z.string(),   // ISO日時
            }),
          },
        },
      },
    },
  });
