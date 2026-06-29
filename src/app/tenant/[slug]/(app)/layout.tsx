import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/tenant/layout/app-sidebar';
import { userType } from '@/types/user';
import { isAuthenticated } from '@/server/users';

export default async function TenantLayout({
  children,
  params
}: LayoutProps<'/tenant/[slug]'>) {
  const { slug: tenantSlug } = await params;

  // Verify that the tenant exists in the database. If it doesn't exist, return a 404 error.
  const slug = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, name: true, slug: true }
  });

  if (!slug) notFound();

  const session = await isAuthenticated();

  if (!session) {
    // Not authenticated, redirect to the login page with the tenant slug as a query parameter
    redirect(`/tenant/${tenantSlug}/login?error=not-authenticated`);
  }

  // Verify that the user is a member of this organization
  const member = await prisma.member.findFirst({
    where: { organizationId: slug.id, userId: session.user.id }
  });

  if (!member) {
    // User is not a member of this organization, redirect to the login page with an error message
    redirect(`/tenant/${tenantSlug}/login?error=no-member`);
  }

  const user = session.user;

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' user={user as userType} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
