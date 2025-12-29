---
paths:
  - "**/auth*"
  - "**/login*"
  - "**/signup*"
  - "**/*session*"
---

# NextAuth (Auth.js v5) 規約

## ファイル構成

```
apps/web/src/
├── auth.ts               # メイン設定（adapter含む）
├── auth.config.ts        # プロバイダー設定（adapter不要）
├── middleware.ts         # 認証ミドルウェア
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts  # APIルート
```

## auth.ts（メイン設定）

```typescript
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@repo/db";
import { users, accounts, sessions, verificationTokens } from "@repo/db";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  ...authConfig,
});
```

## auth.config.ts（プロバイダー設定）

```typescript
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
```

## APIルート

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

## middleware.ts

```typescript
import { auth } from "./auth";

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/notebook/:path*"],
};
```

## セッション取得

### サーバーコンポーネント
```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return <div>Hello, {session.user.name}</div>;
}
```

### クライアントコンポーネント
```typescript
"use client";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;
  return <div>Hello, {session.user?.name}</div>;
}
```

## サインイン・サインアウト

```typescript
import { signIn, signOut } from "@/auth";

// サーバーアクション
export async function handleSignIn() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}
```

## 環境変数

```env
# .env.local
AUTH_SECRET=your-secret-key  # openssl rand -base64 32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## ルール

- `auth.ts` は adapter 含む完全な設定
- `auth.config.ts` は adapter 不要な設定（middleware用）
- セッション取得はサーバー側で `await auth()`
- クライアント側は `useSession()` フック
- 認証チェックは middleware または callbacks.authorized で
