## Why

The campaign generator currently requires paid Anthropic API usage even though its AI workload is bounded text transformation and structured extraction. Moving to Groq's free-tier GPT-OSS 120B keeps the campaign vision and editorial safeguards intact while removing the MVP's mandatory Claude cost.

## What Changes

- Replace the Anthropic runtime integration with Groq and use `openai/gpt-oss-120b` as the default copy model.
- Generate provider-enforced structured JSON for complete campaigns and single-field refinements.
- Replace the Anthropic environment variable and dependency with their Groq equivalents.
- Preserve the existing prompts, response shapes, defensive checks, visual templates, and client-facing API contracts.
- Document Groq account setup, local configuration, Vercel configuration, free-tier limitations, and model overrides.

## Capabilities

### New Capabilities

- `groq-copy-generation`: Generate campaign copy and assisted field refinements through Groq/GPT-OSS 120B with schema-constrained responses and documented configuration.

### Modified Capabilities

None.

## Impact

- API routes: `src/app/api/generar-campana/route.ts` and `src/app/api/refinar-campo/route.ts`.
- Dependencies: remove `@anthropic-ai/sdk` and add the Groq JavaScript SDK.
- Configuration: replace `ANTHROPIC_API_KEY` with `GROQ_API_KEY`; retain `COPY_MODEL` with a new default.
- Documentation: update `.env.local.example`, `README.md`, and the original architecture/design document where it describes the live provider.
- Deployment: Vercel must receive `GROQ_API_KEY` before the migrated AI routes can run.
