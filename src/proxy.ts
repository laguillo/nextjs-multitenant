import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'pie.com';

// Better Auth establece esta cookie al iniciar sesión
const SESSION_COOKIE = 'better-auth.session_token';

// Rutas públicas del tenant: accesibles sin sesión
const TENANT_PUBLIC_PATHS = ['/ingreso'];

/**
 * Extrae el subdominio del tenant del host de la request.
 * Devuelve null si la request viene del dominio raíz.
 *
 * Desarrollo local: slug.localhost[:puerto]
 * Producción:       slug.domain.com
 */
function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') ?? '';

  // Dev local — parsear desde la URL completa es más fiable que el header host
  // porque Next.js dev server puede normalizar el header
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // "http://tenant1.localhost:3000/..." → "tenant1"
    const match = url.match(/https?:\/\/([^.]+)\.localhost/);
    if (match?.[1]) return match[1];

    // Fallback: header host "tenant1.localhost:3000"
    const hostname = host.split(':')[0];
    if (hostname.includes('.localhost')) return hostname.split('.')[0];

    return null;
  }

  // Producción: "slug.domain.com" → "slug"
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

  // Ignorar rutas internas de Next.js y archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomain(request);

  // ── Dominio raíz: landing, auth, /app, /admin ──────────────────────────────
  // Dejar pasar — cada ruta gestiona su propia autenticación en su layout
  if (!subdomain) {
    return NextResponse.next();
  }

  // ── Subdominio de tenant ────────────────────────────────────────────────────

  // Rutas públicas del tenant (login de campaña): reescribir sin auth guard
  if (isTenantPublicPath(pathname)) {
    const rewriteUrl = new URL(
      `/tenant/${subdomain}${pathname}${search}`,
      request.url
    );
    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set('x-tenant', subdomain);
    return res;
  }

  // Protección optimista: si no hay cookie de sesión → login del tenant
  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has(`__Secure-${SESSION_COOKIE}`);

  if (!hasSession) {
    const loginUrl = new URL(
      `/ingreso?from=${encodeURIComponent(pathname)}`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  // Rewrite transparente: /path → /tenant/[slug]/path
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
    // Ejecutar en todas las rutas excepto archivos estáticos e internos de Next
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
};
