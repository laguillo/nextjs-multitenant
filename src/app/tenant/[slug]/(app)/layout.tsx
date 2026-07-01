import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/tenant/layout/app-sidebar';
import { SiteHeader } from '@/components/tenant/layout/site-header';
import { userType } from '@/types/user';
import { isAuthenticated } from '@/server/users';

export default async function TenantLayout({
  children,
  params
}: LayoutProps<'/tenant/[slug]'>) {
  const { slug: tenantSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, name: true, slug: true }
  });

  if (!org) notFound();

  // The proxy sets x-tenant on subdomain requests (slug.domain.com).
  // Direct path access (/tenant/[slug]) does not have this header.
  // On subdomain: redirect to /login — the proxy rewrites it to /tenant/[slug]/login.
  // On path access: redirect to the full tenant login path directly.
  const requestHeaders = await headers();
  const isSubdomainAccess = requestHeaders.get('x-tenant') !== null;

  const loginPath = isSubdomainAccess
    ? '/login'
    : `/tenant/${tenantSlug}/login`;

  const session = await isAuthenticated();

  if (!session) {
    redirect(`${loginPath}?error=not-authenticated`);
  }

  const member = await prisma.member.findFirst({
    where: { organizationId: org.id, userId: session.user.id }
  });

  if (!member) {
    redirect(`${loginPath}?error=no-member`);
  }

  return (
    <SidebarProvider>
      <AppSidebar
        variant='inset'
        user={session.user as userType}
        slug={org.slug}
        orgName={org.name}
      />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
