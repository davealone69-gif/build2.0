# Forge Android Builder

Forge is an Android-first, local-first app builder that interviews a user about an app idea, validates a build brief through the API, and stores project briefs on-device.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/forge-android-builder run typecheck` — check the Android client
- `pnpm --filter @workspace/api-server run typecheck` — check the API
- No database is required for the current product surface; project briefs persist in the Android client with AsyncStorage.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/forge-android-builder/app/` — Expo Router screens for Home, Projects, Interview, Blueprint, and local model Settings
- `artifacts/forge-android-builder/lib/forge-store.tsx` — on-device project and local model settings persistence
- `artifacts/forge-android-builder/lib/local-model.ts` — Ollama-compatible local model adapter
- `artifacts/api-server/src/routes/forge.ts` — guided interview and blueprint validation endpoints
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `artifacts/forge-android-builder/constants/colors.ts` — Forge visual tokens

## Architecture decisions

- The mobile client is local-first: saved briefs use AsyncStorage and do not require an account or cloud database.
- The LLM boundary is an Ollama-compatible endpoint configured by the user; Forge never pretends a brief is source code or an APK.
- If the configured local model cannot be reached, the API-backed guided interview remains usable and returns an explicitly labeled guided brief.
- The Express API owns input validation and deterministic guided questions; OpenAPI remains the contract for generated client types.

## Product

- Start an app idea from a plain-language prompt.
- Answer a one-question-at-a-time product interview.
- Use a configured local model for question generation and brief synthesis.
- Fall back to a real guided interview when no local model is reachable.
- Review and persist a structured Android build brief.
- Reopen or delete local project briefs.
- Configure and test the local model endpoint.

## User preferences

- Do not fabricate generated source files, APKs, completed integrations, or model responses.

## Gotchas

- On a physical Android device, `127.0.0.1` points to the phone; configure the computer's LAN IP for the local model endpoint.
- The Expo workflow logs an optional React Native DevTools warning about a missing system `libglib` library; Metro and the phone preview still run.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
