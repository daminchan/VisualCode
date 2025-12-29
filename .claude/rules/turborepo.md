# Turborepo パッケージ戦略

path: `**/*`

## 戦略一覧

| 場所 | 戦略 | 説明 |
|------|------|------|
| `apps/*` | Compiled | 型定義をビルドしてエクスポート |
| `packages/*` | JIT | TypeScriptソースを直接エクスポート |

## Compiled Package (apps/api)

RPC用の型定義のみビルドする。

### tsconfig.build.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/hc.ts"]
}
```

### package.json
```json
{
  "exports": {
    "./hc": {
      "import": {
        "types": "./dist/hc.d.ts",
        "default": "./dist/hc.js"
      }
    }
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "tsx src/index.ts"
  }
}
```

**MUST:**
- `tsconfig.build.json` で `hc.ts` のみビルド
- `declaration: true` と `declarationMap: true` を設定
- dev/start は `tsx` でランタイム実行

## JIT Package (packages/*)

共有パッケージはビルド不要。

### package.json
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

**MUST:**
- exports は `./src/` のTypeScriptソースを直接参照
- build スクリプトは不要

## 参考

https://turborepo.com/docs/core-concepts/internal-packages
