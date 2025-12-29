---
paths: packages/db/**/*
---

# Drizzle ORM (packages/db) 規約

## ディレクトリ構造

```
packages/db/
├── src/
│   ├── index.ts          # 全エクスポート
│   ├── client.ts         # Turso接続
│   └── schema/           # テーブル定義（ファイル分割）
│       ├── index.ts      # 全スキーマ集約
│       ├── notebooks.ts
│       ├── users.ts      # NextAuth用
│       ├── accounts.ts   # NextAuth用
│       └── sessions.ts   # NextAuth用
├── migrations/           # マイグレーションファイル
├── drizzle.config.ts
└── package.json
```

## スキーマ定義

### 基本形式
```typescript
// schema/notebooks.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const notebooks = sqliteTable("notebooks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 型エクスポート（必須）
export type Notebook = typeof notebooks.$inferSelect;
export type NewNotebook = typeof notebooks.$inferInsert;
```

### スキーマ集約
```typescript
// schema/index.ts
export * from "./notebooks";
export * from "./users";
export * from "./accounts";
export * from "./sessions";
export * from "./verification-tokens";
```

## NextAuth用スキーマ

```typescript
// schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
});

export type User = typeof users.$inferSelect;
```

```typescript
// schema/accounts.ts
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));
```

```typescript
// schema/sessions.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});
```

## Turso接続

```typescript
// client.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

## drizzle.config.ts

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

## ルール

- テーブル名は snake_case 複数形（`notebooks`, `users`）
- カラム名は snake_case（`user_id`, `created_at`）
- 各テーブルで `$inferSelect`, `$inferInsert` 型をエクスポート
- ID は CUID2 を使用（`@paralleldrive/cuid2`）
- タイムスタンプは integer + mode: "timestamp"
