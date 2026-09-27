---
name: Local model boundary
description: Product truthfulness rule for Forge's local LLM workflow.
---

Forge's local LLM feature must use an explicit Ollama-compatible endpoint configured by the user. If it is unreachable, the app may use the API-backed guided interview, but it must label that mode clearly and must not present a build brief as generated Android source, an APK, or a completed app.

**Why:** A local-first product cannot honestly imply that arbitrary Android source generation is available without a model runtime and a compiler/export pipeline.

**How to apply:** Keep model connectivity, guided mode, build briefs, and eventual source generation as separate states in the UI and API contracts.