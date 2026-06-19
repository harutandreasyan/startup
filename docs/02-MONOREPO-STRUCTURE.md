# 02 — Monorepo Structure

## Why Monorepo?
Single repository containing web app, mobile app, and backend. Shared types, utilities, and API client code. One PR can update the API and both frontends together.

## Initialize

```bash
# Create the project
mkdir creatorai && cd creatorai
npm init -y

# Install Turborepo
npm install -D turbo typescript @types/node

# Create workspace structure
mkdir -p apps/web apps/mobile apps/api
mkdir -p packages/shared packages/api-client packages/ui
```

## Root Configuration Files

### package.json (root)
```json
{
  "name": "creatorai",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npx turbo dev",
    "dev:web": "npx turbo dev --filter=web",
    "dev:api": "npx turbo dev --filter=api",
    "build": "npx turbo build",
    "lint": "npx turbo lint",
    "clean": "npx turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.9.0",
    "typescript": "^6.0.0"
  },
  "packageManager": "npm@10.9.2"
}
```

npm workspaces are configured via the `"workspaces"` field in package.json (no separate config file needed).

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".expo/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### tsconfig.base.json (shared TS config)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## Package: packages/shared

Shared TypeScript types and constants used by all apps.

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts          # User, AuthToken types
│   │   ├── generation.ts    # Generation request/response types
│   │   ├── credit.ts        # Credit, Transaction types
│   │   ├── subscription.ts  # Plan, Subscription types
│   │   └── index.ts
│   ├── constants/
│   │   ├── plans.ts         # Subscription plan definitions
│   │   ├── models.ts        # AI model metadata
│   │   ├── credits.ts       # Credit costs per operation
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Key shared types (packages/shared/src/types/generation.ts)
```typescript
export type GenerationType = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'text-to-3d' | 'background-removal' | 'upscale';

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationRequest {
  type: GenerationType;
  prompt?: string;
  negativePrompt?: string;
  inputImageUrl?: string;
  model: string;
  params: Record<string, unknown>;
}

export interface GenerationResult {
  id: string;
  status: GenerationStatus;
  type: GenerationType;
  outputUrls: string[];
  creditsCost: number;
  createdAt: string;
  completedAt?: string;
}
```

## Package: packages/api-client

Auto-generated or hand-written API client shared between web and mobile.

```
packages/api-client/
├── src/
│   ├── client.ts         # Axios/fetch wrapper with auth
│   ├── endpoints/
│   │   ├── auth.ts       # login, register, refresh
│   │   ├── generations.ts # create, get, list
│   │   ├── credits.ts    # balance, purchase, history
│   │   └── user.ts       # profile, settings
│   └── index.ts
├── package.json
└── tsconfig.json
```

## App: apps/web

```bash
# Initialize with Vite
cd apps/web
npm create vite . --template react-ts
npm add react-router-dom zustand @tanstack/react-query axios
npm add -D tailwindcss @tailwindcss/vite
```

## App: apps/mobile

```bash
# Initialize with Expo
cd apps/mobile
npx create-expo-app . --template blank-typescript
npm add expo-router react-native-reanimated
npm add zustand @tanstack/react-query axios
```

## App: apps/api

```bash
# Initialize NestJS
cd apps/api
npx @nestjs/cli new . --package-manager npm --skip-git
npm add @prisma/client bullmq ioredis @nestjs/bullmq
npm add -D prisma
```

## Dependency Graph

```
apps/web ──────────┐
                   ├──> packages/shared (types, constants)
apps/mobile ───────┤
                   ├──> packages/api-client (API calls)
apps/api ──────────┘
```

## Steps

- [ ] Initialize root monorepo with npm + Turborepo
- [ ] Create shared package with initial types
- [ ] Scaffold web app with Vite + React + TypeScript
- [ ] Scaffold mobile app with Expo
- [ ] Scaffold API with NestJS
- [ ] Create api-client package
- [ ] Verify `npm dev` starts all apps
- [ ] Set up ESLint + Prettier (shared config)
- [ ] Initialize git repo, create .gitignore, first commit

## Next Step
Proceed to [03-BACKEND-API.md](./03-BACKEND-API.md)
