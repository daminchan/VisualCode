# Visual Code Notebook

> **このファイルを読んだら「CLAUDE.mdを確認しました」と宣言すること**

## Why

「動くコード」をビジュアル付きで保存できるスクラップブック。
GeminiなどのAIで生成したReactコードを貼り付け、プレビュー＆保存。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| モノレポ | Turborepo + pnpm |
| フロント | Next.js 15 (App Router) |
| スタイル | Tailwind CSS v4 + shadcn/ui |
| バックエンド | Hono + @hono/zod-openapi |
| ORM | Drizzle ORM |
| DB | Turso (LibSQL) |
| 認証 | NextAuth (Auth.js v5) |

## ディレクトリ構造

```
apps/
├── web/          # Next.js - Compiled（.claude/rules/apps-web.md）
└── api/          # Hono - Compiled（.claude/rules/apps-api.md）

packages/
├── db/           # Drizzle - JIT（.claude/rules/packages-db.md）
├── ui/           # 共有UI - JIT
└── typescript-config/
```

## コマンド

```bash
pnpm dev                          # 全アプリ起動
pnpm dev --filter @repo/web       # webのみ
pnpm build                        # ビルド
pnpm check                        # 型チェック + lint
pnpm --filter @repo/db db:push    # DBスキーマ反映
pnpm --filter @repo/db db:studio  # Drizzle Studio
```

## 開発ワークフロー

### Phase 0: スキル判定（実装前に必須）
```
【スキル判定】
タスク: [タスクの要約]
該当スキル: [スキル名] / なし
理由: [判定理由]
```
→ 該当スキルがあれば起動、なければPhase 1へ

### Phase 1: 調査・設計
- タスク理解（不明点は質問）
- 影響範囲の特定（apps/web? api? packages/db?）

### Phase 2: 実装
```
【実装宣言】
■ タスク: [タスク名]
■ 変更対象: [対象パッケージ]
■ 変更ファイル: [一覧]
```

### Phase 3: 品質確認
```bash
pnpm check
```
→ 通過後、コミット確認（**許可なくcommit/push禁止**）

## 厳守事項

| ルール | 対応 |
|--------|------|
| `any` 禁止 | `unknown` + 型ガード |
| `as` 禁止 | 型ガードで解決 |
| Linter | Biome準拠（抑制コメント禁止） |
| 機密情報 | `.env.local` で管理 |
| 環境保全 | dev/buildを無闘に実行しない |
| main直push | 禁止 |

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| パッケージ | `@repo/` | `@repo/db` |
| コンポーネント | PascalCase | `NotebookCard.tsx` |
| フック | use + camelCase | `useNotebooks.ts` |
| DBテーブル | snake_case（複数形） | `notebooks` |

## コミットメッセージ

```
<type>(<scope>): <英語で概要>

<日本語で詳細説明>
```

type: `feat` | `fix` | `docs` | `refactor` | `chore`

## DoD（完了チェック）

- [ ] スキル判定を実施したか
- [ ] `any` / `as` 未使用か
- [ ] `pnpm check` 通過したか
- [ ] コミット前にユーザー確認したか

## 詳細ルール

`.claude/rules/` 参照:
- `apps-web.md` - Next.js
- `apps-api.md` - Hono + RPC
- `packages-db.md` - Drizzle
- `turborepo.md` - パッケージ戦略
- `auth.md` - NextAuth

## 参照

- `CONCEPT.md` - プロジェクトコンセプト
