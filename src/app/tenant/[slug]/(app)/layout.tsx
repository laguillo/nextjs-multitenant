import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppSidebar } from '@/components/dashboard/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

// Next.js 16: LayoutProps es un helper global (no requiere import)
export default async function TenantLayout({
  children,
  params
}: LayoutProps<'/tenant/[slug]'>) {
  const { slug: tenantSlug } = await params;

  // Verificar que la organización existe en la base de datos.
  // Si no existe → 404 (el proxy no valida slugs contra la DB).
  const slug = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, name: true, slug: true }
  });

  if (!slug) notFound();

  // Validar sesión real con Better Auth
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // Redirigir al login del tenant (el proxy lo reescribe; en acceso directo
    // usa la ruta interna /tenant/[slug]/ingreso como fallback explícito).
    redirect(`/tenant/${tenantSlug}/ingreso`);
  }

  // Verificar que el usuario es miembro de esta organización
  const member = await prisma.member.findFirst({
    where: { organizationId: slug.id, userId: session.user.id }
  });

  if (!member) {
    // Autenticado en la plataforma pero no pertenece a esta organización
    redirect(`/tenant/${tenantSlug}/ingreso?error=no-member`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
