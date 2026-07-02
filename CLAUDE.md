# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev          # start dev server
bun build        # production build
bun lint         # ESLint
bun run start    # serve production build
```

Prisma:
```bash
bunx prisma migrate dev      # create & apply migration
bunx prisma migrate deploy   # apply pending migrations
bunx prisma db push          # push schema without migration history
bunx prisma generate         # regenerate client (output: src/generated/prisma)
bunx prisma studio           # GUI database browser
```

## Architecture

### Multi-tenancy model

The app has two routing domains:

**Platform routes** — used by the SaaS owner and its users:
- `/(public)` — marketing/landing pages
- `/(auth)` — platform sign-up, login, forgot/reset password
- `/(protected)/dashboard` — authenticated platform users
- `/(protected)/admin` — admin-only (requires `user.role === 'admin'`)

**Tenant routes** — each org gets its own space at `/tenant/[slug]`:
- `/tenant/[slug]/(auth)/login` — tenant-scoped login
- `/tenant/[slug]/(app)` — authenticated tenant app

### Auth (Better Auth)

All auth is handled by `better-auth` at `src/lib/auth.ts`. The catch-all API route at `src/app/api/auth/[...all]/route.ts` delegates everything to `toNextJsHandler(auth)`.

Plugins in use: `organization` (tenants), `admin`, `lastLoginMethod`, `nextCookies`.

**Client-side**: `src/lib/auth-client.ts` — use `authClient` from here in client components (has `adminClient` and `organizationClient` plugins).

**Server-side session check**: call `isAuthenticated()` from `src/server/users.ts` in Server Components and layouts. It calls `auth.api.getSession({ headers: await headers() })`.

**Cross-subdomain cookies**: enabled in production via `NEXT_PUBLIC_ROOT_DOMAIN`. In `localhost` dev this is intentionally disabled (browsers reject `domain=localhost` on cookies).

### Route protection

`src/proxy.ts` exports a `proxy()` function and `config.matcher` for `/dashboard/:path*` and `/admin/:path*`. This is an optimistic fast-path check — it only verifies a session cookie exists.

The real membership/role validation happens in the layouts:
- `/(protected)/dashboard/layout.tsx` — calls `isAuthenticated()`, redirects to `/login` if none
- `/(protected)/admin/layout.tsx` — calls `isAuthenticated()`, calls `unauthorized()` if not admin
- `/tenant/[slug]/(app)/layout.tsx` — validates org exists in DB, then session, then checks `member` table for org membership

### Database

PostgreSQL via Prisma 7 with the `@prisma/adapter-pg` driver adapter. Prisma client is generated to `src/generated/prisma` (not the default path). Always import from `@/generated/prisma/client`. The singleton client is at `src/lib/prisma.ts`.

Schema models: `User`, `Session`, `Account`, `Verification`, `Organization`, `Member`, `Invitation`.

### Server actions

`src/server/` contains server actions (`'use server'`) for data access:
- `users.ts` — `isAuthenticated`, `forgotPassword`, `resetPassword`
- `organizations.ts` — `getOrganizations`, `getActiveOrganization`, `getOrganizationBySlug`
- `members.ts` — `addMember`, `removeMember`, `getMembersByOrg`, `getCurrentMember`

### RBAC

Custom access control in `src/lib/auth-permissions.ts` using `better-auth/plugins/access`. Roles: `owner` (create/update/delete on org and projects) and `member` (create on projects). The `OrgRole` type in `src/server/members.ts` lists the domain-specific roles (`owner | analyst | lawyer | witness | promoter | candidate`).

### UI

shadcn/ui components in `src/components/ui/`. Tailwind CSS v4. Component aliases are configured in `components.json`. Add new shadcn components with:
```bash
bunx shadcn add <component>
```

Transactional emails are React components in `src/components/emails/` using `react-email`, sent via Resend.

### Environment variables

Required `.env` keys:
```
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ROOT_DOMAIN
BETTER_AUTH_SECRET
BETTER_AUTH_URL
BETTER_AUTH_TRUSTED_ORIGINS
DATABASE_URL
RESEND_API_KEY
EMAIL_SENDER_NAME
EMAIL_SENDER_ADDRESS
```

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (OAuth).
