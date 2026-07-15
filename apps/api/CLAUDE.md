# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Learning-oriented REST API built with [Hono](https://hono.dev) on the Node.js runtime. It exposes JWT-authenticated CRUD endpoints for a "tasks" resource. Task state is held in an **in-memory array** (`taskList` in `src/routes/tasks.ts`) — there is no database, so all data resets on restart.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

- `pnpm dev` — run in watch mode. Uses Node's native TypeScript execution (`node --watch --env-file=.env src/index.ts`); there is no build step or ts-node in the dev loop.
- `pnpm typecheck` — `tsc --noEmit`, the primary correctness gate. Run this after changes.
- `pnpm test` — runs Vitest. **No test files exist yet**; a single test would be run with `pnpm vitest run <file>` or `pnpm vitest -t "<name>"`.
- `pnpm build` — `hono build`.

Requires a `.env` file with `JWT_SECRET` (see Environment below). `pnpm dev` loads it via `--env-file`; other entry points do not.

## Runtime & TypeScript conventions

These are non-obvious and easy to break:

- **Relative imports must include the `.ts` extension** (e.g. `import auth from "./routes/auth.ts"`). This is required by `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` in `tsconfig.json` and by Node's native TS loader. Omitting `.ts` will fail typecheck/runtime.
- **Zod v4** is used (not v3). APIs differ from older docs: top-level string formats like `z.email()` and `z.uuidv4()`, and error helpers `z.flattenError()` / `z.treeifyError()`. Prefer these over v3 equivalents (`z.string().email()`, `error.flatten()`).
- `strict` and `noUncheckedIndexedAccess` are on — array/index access is `T | undefined` and must be null-checked (see the `currentTask` guards in `tasks.ts`).
- ESM only (`"type": "module"`), target ES2023, `verbatimModuleSyntax` — use `import type` for type-only imports.

## Architecture

Request flow: `src/index.ts` mounts sub-routers with `app.route()` and registers global `notFound` / `onError` handlers.

Directory roles under `src/`:
- `routes/` — one `Hono` instance per resource, default-exported and mounted in `index.ts`. `tasks.ts` applies auth middleware at the router level (`tasks.use(...)`) so every task route is protected.
- `middlewares/` — `auth.ts` wraps Hono's `jwt()` for token verification; `require-role.ts` is a factory returning a middleware that checks the decoded `jwtPayload.role`.
- `schemas/` — Zod schemas. A single base schema is derived into request-specific ones with `.omit()`/`.pick()`/`.partial()`/`.extend()` (see `task.ts`). Inferred types (`TaskType`) come from these schemas — treat the schema as the source of truth.
- `lib/` — shared infrastructure: `validate-schemas.ts` (the `validateSchema` wrapper), `env.ts` (validated config), `jwt-variables-env.ts` (typing for `c.get("jwtPayload")`).

### Cross-cutting patterns

- **Validation:** never call `zValidator` directly in routes. Use `validateSchema(target, schema)` from `lib/validate-schemas.ts` — it standardizes 400 error shape (`{ error, details }`). Read validated data with `c.req.valid("json" | "param" | "query")`.
- **Errors:** throw `HTTPException(status, { message })` from route/middleware code for expected failures. The global `onError` in `index.ts` converts `HTTPException` to `{ error: message }` with its status and turns anything else into a generic 500 — so route code should not build its own error JSON for these cases.
- **Typed JWT context:** routers that read the JWT payload are typed as `new Hono<JwtVariablesEnv>()` (from `lib/jwt-variables-env.ts`), which gives `c.get("jwtPayload")` its `{ sub, role }` shape. Add this generic when a new router needs the payload.
- **Auth model:** `POST /auth/login` currently issues a token for any valid email/password with a hardcoded `role: "ADMIN"` and 1h expiry — there is no user store or password check. Treat it as a stub.

## Environment

`src/lib/env.ts` validates `process.env` with Zod **at import time** — a missing/invalid var throws immediately on startup. Required: `JWT_SECRET` (non-empty). Optional: `PORT` (defaults to 3000, though `index.ts` currently hardcodes port 3000 in `serve`).
