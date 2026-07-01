import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'domain.com';

const SESSION_COOKIE = 'better-auth.session_token';

const TENANT_PUBLIC_PATHS = ['/login'];

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') ?? '';

  // Parse from the full URL rather than the host header — the Next.js dev
  // server can normalize the host header in ways that break subdomain detection.
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const match = url.match(/https?:\/\/([^.]+)\.localhost/);
    if (match?.[1]) return match[1];

    const hostname = host.split(':')[0];
    if (hostname.includes('.localhost')) return hostname.split('.')[0];

    return null;
  }

  const hostname = host.split(':')[0];
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    return slug || null;
  }

  return null;
}

function isTenantPublicPath(pathname: string): boolean {
  return TENANT_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomain(request);

  if (!subdomain) {
    return NextResponse.next();
  }

  if (isTenantPublicPath(pathname)) {
    const rewriteUrl = new URL(
      `/tenant/${subdomain}${pathname}${search}`,
      request.url
    );
    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set('x-tenant', subdomain);
    return res;
  }

  // Optimistic guard: if no session cookie exists, redirect before the layout runs.
  // The real membership/role check happens in the tenant layout.
  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has(`__Secure-${SESSION_COOKIE}`);

  if (!hasSession) {
    const loginUrl = new URL(
      `/login?from=${encodeURIComponent(pathname)}`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  const rewriteUrl = new URL(
    `/tenant/${subdomain}${pathname === '/' ? '' : pathname}${search}`,
    request.url
  );
  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set('x-tenant', subdomain);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
};
