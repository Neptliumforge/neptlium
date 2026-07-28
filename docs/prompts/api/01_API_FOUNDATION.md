# 01_API_FOUNDATION.md

# NEPTLIUM API FOUNDATION
## API Runtime Foundation
### Version 1.0

---

# PURPOSE

This specification defines the complete runtime foundation of the Neptlium API.

It establishes the application's architecture, runtime, configuration model, transport layer, request lifecycle, health endpoints, error contracts, environment parsing, and workspace integration.

No wallet logic, ledger logic, provider integration, or authentication implementation belongs here. Those are defined in later specifications.

---

# PRIMARY OBJECTIVE

Create a first-class backend application:

apps/api

The API must become a native member of the existing pnpm workspace and Turborepo.

The API must build independently while remaining fully integrated with the monorepo.

---

# DESIGN PRINCIPLES

The runtime must be:

Production-oriented

Stateless

Deterministic

Framework-consistent

Strongly typed

Secure by default

Provider-independent

Environment-aware

Extensible

Auditable

---

# APPLICATION STRUCTURE

The implementation should follow the repository's existing architectural conventions.

A preferred structure is:

apps/api/

    src/

        config/

        bootstrap/

        middleware/

        routes/

        controllers/

        services/

        validation/

        errors/

        transport/

        health/

        utils/

        types/

        providers/

        tests/

package.json

tsconfig.json

README.md

.env.example

vercel.json (only if required)

Folder names may vary slightly if repository conventions require it.

---

# TRANSPORT LAYER

The runtime must expose HTTP only.

Transport concerns must remain isolated from domain logic.

Responsibilities include:

request parsing

response serialization

middleware

routing

error serialization

request IDs

logging hooks

health endpoints

No business logic belongs in transport.

---

# API VERSIONING

The initial version is:

/v1

Every endpoint must exist beneath this namespace.

Future versions must coexist without breaking previous versions.

---

# REQUIRED FOUNDATION ROUTES

GET

/v1/health

GET

/v1/version

GET

/v1/status

Only health-related functionality belongs here.

---

# HEALTH ENDPOINT

Health must report only safe operational information.

Example categories:

runtime

environment

build version

uptime

request ID

API version

Health must never expose:

secrets

provider credentials

service-role keys

wallet information

database passwords

internal tokens

private configuration

---

# STATUS ENDPOINT

Status should expose operational readiness.

Possible fields:

runtime

healthy

build

environment

provider availability

database configured

provider configuration state

Provider state must be truthful.

Example:

Coinbase

Not Configured

Alchemy

Not Configured

Never report configured services unless verified.

---

# VERSION ENDPOINT

Expose immutable build metadata.

Possible information:

API version

Git SHA

Build timestamp

Application version

Environment

No secrets.

---

# REQUEST PIPELINE

Every request follows:

Receive

↓

Assign Request ID

↓

Logging middleware

↓

Security middleware

↓

Validation

↓

Route handler

↓

Domain service

↓

Serialization

↓

Response

Errors may terminate the pipeline safely.

---

# REQUEST IDS

Every request receives a unique request ID.

The ID must:

appear in logs

appear in structured errors

appear in audit events

appear in health diagnostics

Clients should receive the request ID in the response headers where appropriate.

---

# CONFIGURATION

All configuration must be centralized.

No scattered process.env access.

Use typed environment parsing.

Invalid configuration should fail fast during startup.

---

# REQUIRED SERVER VARIABLES

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

API_BASE_URL

APP_BASE_URL

ADMIN_BASE_URL

API_ENVIRONMENT

LOG_LEVEL

Optional provider variables:

CDP_API_KEY_ID

CDP_API_KEY_SECRET

CDP_WALLET_SECRET

ALCHEMY_API_KEY

ALCHEMY_RPC_URL

ALCHEMY_WEBHOOK_SIGNING_KEY

---

# ENVIRONMENT MODES

Support:

local

development

test

preview

production

Environment behavior must remain deterministic.

---

# ENVIRONMENT VALIDATION

Missing required server variables:

Startup failure.

Missing optional provider variables:

Startup succeeds.

Provider functionality returns:

provider_not_configured

---

# STRUCTURED ERRORS

Every public error must follow a single contract.

Example

{
  "error": {
    "code": "...",
    "message": "...",
    "request_id": "...",
    "details": {}
  }
}

No stack traces.

No internal implementation details.

No framework errors.

---

# ERROR CATEGORIES

validation_error

authentication_required

permission_denied

resource_not_found

unsupported_asset

unsupported_network

provider_not_configured

rate_limited

conflict

internal_error

configuration_error

unknown_error

Every error maps to deterministic HTTP status codes.

---

# LOGGING

Structured logging only.

Every request should log:

request ID

path

method

duration

status

environment

Safe actor information

Never log:

tokens

passwords

service-role keys

private keys

wallet secrets

provider secrets

---

# MIDDLEWARE

Separate middleware responsibilities:

request IDs

logging

security headers

rate limiting

authentication

authorization

validation

error handling

Middleware must remain composable.

---

# SECURITY HEADERS

Provide production-safe defaults.

Examples:

Strict-Transport-Security

Referrer-Policy

Permissions-Policy

X-Content-Type-Options

Avoid exposing framework internals.

---

# RESPONSE SERIALIZATION

Responses must be:

consistent

typed

deterministic

JSON

No mixed response formats.

---

# WORKSPACE INTEGRATION

The API becomes a first-class workspace package.

Update:

pnpm-workspace.yaml

turbo.json

workspace scripts

CI configuration

TypeScript references

without breaking existing applications.

---

# BUILD REQUIREMENTS

The API must:

install successfully

compile

typecheck

lint

test

build

without provider credentials.

---

# TESTING REQUIREMENTS

Minimum coverage:

startup

environment parsing

health

version

status

structured errors

configuration failure

request IDs

logging contracts

middleware ordering

---

# DOCUMENTATION

Update:

apps/api/README.md

root README

environment documentation

architecture documentation

deployment documentation

Document only implemented behavior.

---

# ACCEPTANCE CRITERIA

This specification is complete only when:

✓ apps/api exists

✓ runtime builds

✓ health endpoints work

✓ version endpoint works

✓ status endpoint works

✓ environment parsing is typed

✓ structured errors exist

✓ request IDs exist

✓ middleware pipeline exists

✓ logging is structured

✓ documentation is updated

✓ workspace integration succeeds

✓ CI remains green

No wallet, provider, authentication, ledger, or persistence logic should be implemented in this phase beyond the runtime foundation necessary to support later specifications.

End of Specification 01.
