# Multitenant Starter

A production-ready multi-tenant SaaS starter built with Next.js, Better Auth, Prisma, and shadcn/ui. Each organization gets its own isolated space with scoped auth, role-based access control, and transactional email flows — all pre-configured.

## Stack

- **Next.js** (App Router) — platform + tenant routing in one repo
- **Better Auth** — email/password, Google OAuth, org invitations, RBAC
- **Prisma 7** + **PostgreSQL** — database with org/member/invitation models
- **shadcn/ui** + **Tailwind CSS v4** — component library
- **React Email** + **Resend** — transactional emails

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```env
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ROOT_DOMAIN=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BETTER_AUTH_TRUSTED_ORIGINS=
DATABASE_URL=
RESEND_API_KEY=
EMAIL_SENDER_NAME=
EMAIL_SENDER_ADDRESS=
```

Optional (Google OAuth):
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Set up the database

```bash
bunx prisma migrate dev
```

### 4. Start the dev server

```bash
bun dev
```

## Routing model

The app has two routing domains:

**Platform** — used by the SaaS owner and its users:
- `/` — landing page
- `/(auth)` — sign-up, login, forgot/reset password
- `/dashboard` — authenticated users
- `/admin` — admin-only (`user.role === 'admin'`)

**Tenant** — each org at `/tenant/[slug]`:
- `/tenant/[slug]/login` — tenant-scoped login
- `/tenant/[slug]/` — authenticated tenant app

## Auth

All auth is handled by [Better Auth](https://www.better-auth.com) at `src/lib/auth.ts`. Plugins in use: `organization` (tenants), `admin`, `lastLoginMethod`, `nextCookies`.

- **Client**: import `authClient` from `src/lib/auth-client.ts`
- **Server**: call `isAuthenticated()` from `src/server/users.ts` in Server Components
- **Route protection**: `src/proxy.ts` checks sessions for `/dashboard` and `/admin`, and does an optimistic cookie check for tenant subdomain routes; real membership/role validation happens in each layout

## Commands

```bash
bun dev          # start dev server
bun build        # production build
bun lint         # ESLint

bunx prisma migrate dev      # create & apply migration
bunx prisma migrate deploy   # apply pending migrations
bunx prisma generate         # regenerate Prisma client
bunx prisma studio           # GUI database browser

bunx shadcn add <component>  # add shadcn/ui component
```

## License

MIT
