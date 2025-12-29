---
paths: apps/api/**/*
---

# Hono (apps/api) 規約

## ディレクトリ構造

```
apps/api/src/
├── index.ts              # エントリーポイント
├── routes/
│   ├── index.ts          # ルート集約・型エクスポート
│   └── notebooks.ts      # /api/notebooks
├── schemas/              # Zodスキーマ（単一の信頼源）
│   └── notebook.ts
├── services/             # ビジネスロジック
│   └── notebooks.ts
├── middlewares/
│   └── auth.ts
└── lib/
    └── db.ts             # DB接続
```

## ルート定義

### 基本形式
```typescript
// routes/notebooks.ts
import { Hono } from "hono";
import { notebooksService } from "../services/notebooks";

const app = new Hono()
  .get("/", async (c) => {
    const notebooks = await notebooksService.findAll();
    return c.json(notebooks);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const notebook = await notebooksService.findById(id);
    if (!notebook) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(notebook);
  })
  .post("/", async (c) => {
    const body = await c.req.json();
    const notebook = await notebooksService.create(body);
    return c.json(notebook, 201);
  });

export default app;
```

### ルート集約・型エクスポート（重要）
```typescript
// routes/index.ts
import { Hono } from "hono";
import notebooks from "./notebooks";

const app = new Hono()
  .route("/notebooks", notebooks);

// RPC用に型をエクスポート（必須）
export type AppType = typeof app;
export default app;
```

## Zodスキーマ（@hono/zod-openapi）

```typescript
// schemas/notebook.ts
import { z } from "@hono/zod-openapi";  // zodではなくこちらからインポート

export const notebookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  code: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).openapi("Notebook");

export const createNotebookSchema = notebookSchema
  .omit({ id: true, createdAt: true, updatedAt: true });

export const updateNotebookSchema = createNotebookSchema.partial();
```

## サービス層

```typescript
// services/notebooks.ts
import { db } from "../lib/db";
import { notebooks } from "@repo/db";
import { eq } from "drizzle-orm";

export const notebooksService = {
  async findAll() {
    return db.select().from(notebooks);
  },

  async findById(id: string) {
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.id, id));
    return notebook;
  },

  async create(data: { title: string; code: string; userId: string }) {
    const [notebook] = await db
      .insert(notebooks)
      .values(data)
      .returning();
    return notebook;
  },

  async delete(id: string) {
    await db.delete(notebooks).where(eq(notebooks.id, id));
  },
};
```

## Hono RPC クライアント（型計算の最適化）

コンパイル時に型を計算するパターンを使用する。

```typescript
// apps/api/src/hc.ts
import { hc } from "hono/client";
import { app } from "./routes";  // import type ではなく実体をインポート

// ダミークライアントで型を事前計算
const client = hc<typeof app>("");
export type Client = typeof client;

// 型付き hc 関数をエクスポート
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);
```

### クライアント側での使用
```typescript
// apps/web/src/lib/api.ts
import { hcWithType } from "@repo/api/hc";

export const api = hcWithType(process.env.NEXT_PUBLIC_API_URL!);
```

**MUST:**
- `app` は実体としてインポート（`import type` ではない）
- ダミークライアント `hc<typeof app>("")` で型を事前計算
- `hcWithType` 関数をエクスポート

参考: https://github.com/m-shaka/hono-rpc-perf-tips-example

## ルール

- ルートはHTTP処理のみ、ロジックはサービス層へ
- `app.route()` でファイル分割
- Zodスキーマは `schemas/` に集約
- 型エクスポート `export type AppType` を忘れない
- エラーレスポンスは統一形式 `{ error: string }`
