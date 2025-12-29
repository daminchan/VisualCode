---
paths: apps/web/**/*
---

# Next.js (apps/web) 規約

## ディレクトリ構造

```
apps/web/src/
├── app/                    # App Router
│   ├── (auth)/             # 認証系 Route Group
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/             # メイン機能 Route Group
│   │   ├── dashboard/
│   │   └── notebook/[id]/
│   ├── api/auth/[...nextauth]/  # NextAuth
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # Header, Sidebar
│   └── features/           # 機能別
│       ├── editor/
│       └── preview/
├── lib/
│   └── api.ts              # Hono RPCクライアント
├── hooks/
├── auth.ts                 # NextAuth設定
└── auth.config.ts          # 認証プロバイダー設定
```

## コンポーネント規約

### 基本形式
```tsx
"use client";  // クライアントコンポーネントのみ

interface NotebookCardProps {
  id: string;
  title: string;
}

export function NotebookCard({ id, title }: NotebookCardProps) {
  return <div>{title}</div>;
}
```

### ルール
- Props は interface で定義（type より interface 推奨）
- `export function` を使用（`export default` は避ける）
- 50行超えたら分割を検討
- サーバーコンポーネントがデフォルト、必要な時だけ `"use client"`

## Hono RPC クライアント

```tsx
// lib/api.ts
import { hc } from "hono/client";
import type { AppType } from "@repo/api";

export const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!);
```

```tsx
// 使用例
const res = await client.api.notebooks.$get();
const data = await res.json();
```

## Tailwind v4

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.15 250);
  --color-secondary: oklch(0.7 0.1 200);
  --radius-lg: 0.75rem;
}
```

- `size-*` を使用（`w-* h-*` の代わり）
- OKLCH カラー形式

## shadcn/ui

- `components/ui/` に配置
- 必要なコンポーネントだけ追加
- カスタマイズは直接ファイル編集
