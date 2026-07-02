import { AppSidebar } from '@/components/admin/layout/app-sidebar';
import { SiteHeader } from '@/components/admin/layout/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { isAuthenticated } from '@/server/users';
import { userType } from '@/types/user';
import { redirect, unauthorized } from 'next/navigation';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await isAuthenticated();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    unauthorized();
  }

  const user = session.user;

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' user={user as userType} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
