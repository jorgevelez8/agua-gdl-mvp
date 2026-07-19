## ADDED Requirements

### Requirement: Groq generates complete campaign copy
The system SHALL use Groq with `openai/gpt-oss-120b` by default to transform a valid campaign request into the existing campaign response contract.

#### Scenario: Successful campaign generation
- **WHEN** a user submits a valid campaign message and Groq returns a valid response
- **THEN** the API returns `keyword`, `linkDetectado`, and `post`, `story`, and `banner` copy objects in the existing browser-compatible shape

#### Scenario: Explicit model override
- **WHEN** `COPY_MODEL` names a Groq model that supports strict JSON Schema output
- **THEN** both AI routes use that model instead of the default GPT-OSS 120B model

### Requirement: Groq generates field refinements
The system SHALL use the same configured Groq model to refine an assisted field while preserving the field-specific editorial rules.

#### Scenario: Successful field refinement
- **WHEN** a user submits a valid assisted field, current value, and non-empty brainstorm text
- **THEN** the API returns one non-empty `propuesta` string without changing the endpoint's response contract

### Requirement: AI responses are schema constrained
The system MUST request strict JSON Schema output for campaign generation and field refinement and MUST reject missing or unparsable response content.

#### Scenario: Complete campaign schema
- **WHEN** Groq generates campaign copy
- **THEN** its response contains every required campaign property, permits `null` only for nullable fields, and contains no undeclared properties

#### Scenario: Complete refinement schema
- **WHEN** Groq generates a field refinement
- **THEN** its response contains exactly one required string property named `propuesta`

#### Scenario: Missing model content
- **WHEN** the provider response has no parseable message content
- **THEN** the route returns a generic upstream-generation error and does not return a partial result

### Requirement: Existing content safeguards remain enforced
The system SHALL apply the existing post-generation defenses independently of the selected model.

#### Scenario: No verified facts supplied
- **WHEN** neither the campaign message nor the verified-data field contains a concrete figure
- **THEN** all generated `dato` and `datoResaltado` values are returned as `null`

#### Scenario: Explicit link supplied
- **WHEN** the request includes a non-empty explicit link
- **THEN** `linkDetectado` equals that explicit link regardless of the model response

#### Scenario: Missing image keyword
- **WHEN** the parsed response does not contain a usable keyword
- **THEN** the API uses the safe default keyword

### Requirement: Groq configuration is secure and documented
The system SHALL read the Groq credential from the server-only `GROQ_API_KEY` environment variable and SHALL document local and Vercel configuration, model selection, and free-tier limitations.

#### Scenario: Missing API key
- **WHEN** an AI route is called without `GROQ_API_KEY`
- **THEN** it returns a 503 response explaining that AI assistance is not configured without exposing secret values

#### Scenario: Developer configures the project
- **WHEN** a developer follows `.env.local.example` and the README
- **THEN** they can identify where to obtain a Groq key, which variables to configure locally and in Vercel, which model is used by default, and where current free-tier limits are published

### Requirement: Anthropic is no longer a runtime dependency
The system SHALL complete AI generation without the Anthropic SDK, an Anthropic API key, or Claude model identifiers.

#### Scenario: Dependency installation
- **WHEN** project dependencies are installed from the lockfile
- **THEN** the Groq SDK is installed and the Anthropic SDK is not installed as a direct dependency
