# Truck Advertising Marketplace Architecture

## 1. System Architecture

- **Frontend**: Next.js App Router with server components by default, client components only for interactive forms, filters, and messaging UI.
- **Backend**: Next.js route handlers and server actions for authenticated mutations, with explicit service modules under `lib/actions`.
- **Database**: PostgreSQL with Prisma ORM, strong relational model, enums, composite indexes, and soft-delete aware moderation paths.
- **Authentication**: Custom secure session architecture using hashed passwords, signed session tokens, HttpOnly cookies, CSRF-aware form patterns, and RBAC guards in middleware and server actions.
- **Authorization**: Centralized permission helpers with route-level and action-level checks for `guest`, `advertiser`, `carrier_owner`, `fleet_manager`, `admin`, and `super_admin`.
- **Security layers**:
  - Zod validation on every external input
  - rate limiting for auth and inquiry endpoints
  - upload validation abstraction with MIME/type and size checks
  - audit logging for sensitive admin and account events
  - safe error normalization to avoid leaking internals
- **UI architecture**: Design system-like primitives plus marketplace/dashboard feature components. Marketing and dashboard are separated by route groups and shell layouts.

## 2. Folder Structure

```text
app/
  (marketing)/
  (auth)/
  (dashboard)/
  api/
components/
  branding/
  dashboard/
  forms/
  layout/
  marketplace/
  providers/
  shared/
lib/
  actions/
  auth/
  config/
  data/
  db/
  rate-limit/
  security/
  utils/
  validation/
prisma/
public/
styles/
tests/
docs/
```

## 3. Database Schema Design

Core entities:

- `User`: auth identity, role, status, onboarding state, audit relations
- `Session`: active browser sessions with expiry and metadata
- `Company`: carrier organization profile and verification state
- `Fleet`: group of vehicles under a company
- `Vehicle`: truck or trailer metadata
- `AdSurface`: monetizable surface definition tied to a vehicle
- `Listing`: advertiser-facing offer representing inventory availability
- `ListingImage`: proof and gallery media
- `RouteCoverage`: route footprint, countries, and operational scope
- `CampaignInquiry`: advertiser request for a listing
- `CampaignOffer`: carrier response with pricing and terms
- `Booking`: accepted commercial agreement
- `Conversation` / `Message`: structured messaging layer
- `Notification`: user event feed
- `VerificationDocument`: compliance/KYC artifacts
- `Review`: post-booking trust signals
- `AuditLog`: immutable trace of privileged actions

Schema design choices:

- UUID/CUID string primary keys for external safety and horizontal scale.
- Enums for role, status, inquiry states, moderation states, pricing model, ad surface type.
- Composite indexes for listing discovery on `status`, `verificationStatus`, `baseCountry`, `pricingModel`, `availableFrom`.
- Unique constraints for session tokens, email addresses, fleet membership keys, and saved listing tuples.
- Cascade deletes only where safe; otherwise soft lifecycle fields are used.

## 4. RBAC Design

- `guest`: public browsing only
- `advertiser`: saved listings, inquiries, campaigns, account settings
- `carrier_owner`: company ownership, fleet management, verification, listings, offers
- `fleet_manager`: delegated operational management without ownership-only controls
- `admin`: moderation, verification, inquiry monitoring, support tooling
- `super_admin`: full platform governance including admin management and sensitive overrides

Enforcement:

- middleware protects route groups
- server actions assert required roles again
- admin operations emit audit logs
- company-scoped resources require organization membership validation

## 5. Page Map

Public:

- `/`
- `/how-it-works`
- `/advertisers`
- `/transport-companies`
- `/marketplace`
- `/marketplace/[slug]`
- `/faq`
- `/contact`
- `/privacy-policy`
- `/terms`

Auth:

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/verify-email`

Dashboards:

- `/advertiser`
- `/advertiser/saved-listings`
- `/advertiser/inquiries`
- `/advertiser/messages`
- `/advertiser/campaigns`
- `/advertiser/settings`
- `/fleet`
- `/fleet/company`
- `/fleet/vehicles`
- `/fleet/listings`
- `/fleet/availability`
- `/fleet/inquiries`
- `/fleet/messages`
- `/fleet/verification`
- `/fleet/settings`
- `/admin`
- `/admin/users`
- `/admin/verifications`
- `/admin/listings`
- `/admin/inquiries`
- `/admin/audit-logs`
- `/admin/content`

## 6. API / Server Action Plan

Route handlers:

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/listings`
- `POST /api/inquiries`

Server actions:

- advertiser profile updates
- carrier company profile save
- vehicle creation and listing draft creation
- inquiry submission and status updates
- admin moderation and verification actions

## 7. MVP Scope

Included:

- secure auth
- role-aware onboarding
- listing marketplace with filters
- listing detail view
- advertiser inquiry flow
- fleet owner listing management
- admin moderation foundation
- messaging/inbox placeholder UI with backing schema

Deferred:

- live chat websockets
- payment collection
- automated contract e-signature
- real third-party upload provider
- billing/subscriptions engine
- analytics warehouse

## 8. Security Architecture Summary

- password hashing with `bcryptjs`
- signed session token in `HttpOnly`, `Secure`, `SameSite=Lax` cookie
- short session TTL with rotation support
- Zod validation for all form and API inputs
- Prisma-only DB access to reduce injection risks
- output escaping via React by default; no raw HTML rendering
- rate limiting on auth and inquiry endpoints
- safe upload checks for MIME, extension, and file size
- role guards in middleware and services
- audit trail for privileged actions
- generic production-safe error messages
- secrets isolated in environment variables
