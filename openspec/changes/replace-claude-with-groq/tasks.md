## 1. Provider setup

- [x] 1.1 Replace the Anthropic SDK dependency with the official Groq JavaScript SDK and refresh the lockfile.
- [x] 1.2 Add shared Groq model configuration and strict JSON Schemas for campaign and field-refinement responses.

## 2. API migration

- [x] 2.1 Migrate `/api/generar-campana` to Groq/GPT-OSS 120B while preserving its request, response, usage logging, and post-generation safeguards.
- [x] 2.2 Migrate `/api/refinar-campo` to Groq/GPT-OSS 120B while preserving validation, timeout behavior, and its response contract.
- [x] 2.3 Ensure both routes return an explicit 503 configuration error when `GROQ_API_KEY` is absent and generic upstream errors for provider failures.

## 3. Configuration and documentation

- [x] 3.1 Replace Anthropic variables, model guidance, and pricing notes in `.env.local.example` with Groq configuration and free-tier guidance.
- [x] 3.2 Update the README with Groq account setup, local usage, architecture, troubleshooting, Vercel deployment, quota caveats, and model override constraints.
- [x] 3.3 Update historical/current architecture documentation so no active setup instruction incorrectly identifies Claude as the runtime provider.

## 4. Verification

- [x] 4.1 Run a repository-wide provider-reference audit and confirm the only remaining Anthropic/Claude references, if any, are explicitly historical.
- [x] 4.2 Run lint and a production build, fix migration regressions, and review the scoped diff without modifying unrelated workspace changes.
