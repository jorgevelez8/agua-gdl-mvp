## Context

The two server-side AI routes call Anthropic directly, use Claude-specific message and prompt-cache APIs, and recover JSON from free-form text with a regular expression. The browser consumes stable JSON shapes and the image routes render those values independently, so the provider can change without modifying the UI or visual system.

The replacement must work in Next.js 16 App Router route handlers on Vercel, retain the current Spanish editorial prompts, and fail clearly when credentials or free-tier capacity are unavailable.

## Goals / Non-Goals

**Goals:**

- Use Groq's hosted `openai/gpt-oss-120b` model for both AI routes.
- Keep existing request and response contracts unchanged.
- Use strict JSON Schema output instead of extracting an arbitrary JSON substring.
- Keep the Groq credential server-only and provide actionable setup/deployment documentation.
- Preserve defensive application rules that prevent unverified data or links from entering generated pieces.

**Non-Goals:**

- Changing campaign prompts, visual themes, image rendering, Pexels integration, or browser UX.
- Adding automatic fallback to a paid provider when Groq's free-tier quota is exhausted.
- Guaranteeing unlimited or SLA-backed inference on a free service.
- Sending personal or confidential citizen data to the model.

## Decisions

### Use the official Groq JavaScript SDK

Replace `@anthropic-ai/sdk` with `groq-sdk`. The official client provides request timeout/retry controls, typed usage data, and the OpenAI-compatible chat-completions response format needed by the routes. A raw `fetch` client was considered, but it would duplicate error handling and request types without reducing coupling meaningfully.

### Default both routes to GPT-OSS 120B

`COPY_MODEL` will default to `openai/gpt-oss-120b`. The 120B model is preferred over the 20B variant because nuanced Spanish campaign copy and instruction adherence matter more than the small-model latency advantage. The environment override remains available, but documentation will require a Groq model that supports strict JSON Schema outputs.

### Constrain responses with route-specific JSON Schemas

Each route will send a strict JSON Schema through `response_format`. All object properties will be required and all objects will reject additional properties. Nullable campaign fields will explicitly accept `null`. This preserves the browser response contract while eliminating Markdown fences and best-effort regex extraction.

The existing TypeScript interfaces remain the application-side contract. Parsed results will still receive the existing link, keyword, and verified-data defenses because provider-side schema enforcement cannot enforce business truth.

### Keep provider configuration server-only and explicit

The routes will read `GROQ_API_KEY`, which has no `NEXT_PUBLIC_` prefix and therefore remains server-only. Missing credentials will return the existing 503-style configuration error before constructing the client. `COPY_MODEL` remains optional and defaults in server code.

### Treat free-tier exhaustion as a recoverable upstream failure

No automatic provider fallback will be introduced. Groq errors, including quota/rate-limit failures, will be logged server-side without exposing the API key and returned through the existing generic 502 responses. Documentation will explain that free usage is quota-limited and link to Groq's live limits page.

## Risks / Trade-offs

- **[Copy style changes between Claude and GPT-OSS]** → Preserve prompts exactly and verify representative Spanish messages, URLs, figures, and field-refinement cases before deployment.
- **[Free-tier rate limits interrupt a public demo]** → Document the quota and retry behavior; keep provider errors generic in the UI and observable in server logs.
- **[`COPY_MODEL` is overridden with a model lacking strict schemas]** → Document the constraint and allow the provider to fail closed rather than silently accepting malformed output.
- **[A valid schema still contains semantically unsafe copy]** → Retain the existing post-processing that nulls unverified facts and prioritizes explicit links.
- **[Groq changes model availability]** → Keep the model ID configurable so a supported replacement can be deployed without a code edit.

## Migration Plan

1. Add `groq-sdk`, remove the Anthropic SDK, and update both routes.
2. Replace local example configuration and all setup/architecture documentation.
3. Run lint and a production build without exposing or requiring a real credential at build time.
4. Add `GROQ_API_KEY` and the desired `COPY_MODEL` to Vercel, then deploy.
5. Verify representative campaign and field-refinement requests in the deployed environment.
6. Remove `ANTHROPIC_API_KEY` from Vercel after successful verification.

Rollback consists of reverting this change and restoring `ANTHROPIC_API_KEY`; there are no data migrations or persistent records.

## Open Questions

None. The user selected Groq/GPT-OSS 120B and requested complete configuration documentation.
