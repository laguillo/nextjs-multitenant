import { isAuthenticated } from '@/server/users';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FolderOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await isAuthenticated();
  if (!session) redirect('/login');

  const user = session.user;

  const memberships = await prisma.member.findMany({
    where: { userId: user.id },
    include: { organization: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 md:p-10'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome back, {user.name}!
        </h1>
        <p className='text-muted-foreground mt-1'>
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Organizations</CardTitle>
            <Building2 className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{memberships.length}</p>
            <p className='text-muted-foreground text-xs'>Organizations you belong to</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Projects</CardTitle>
            <FolderOpen className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>—</p>
            <p className='text-muted-foreground text-xs'>No projects yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Account type</CardTitle>
            <ShieldCheck className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold capitalize'>{user.role ?? 'User'}</p>
            <p className='text-muted-foreground text-xs'>Your platform role</p>
          </CardContent>
        </Card>
      </div>

      {/* Organizations */}
      <div>
        <h2 className='mb-4 text-xl font-semibold'>My Organizations</h2>
        {memberships.length === 0 ? (
          <Card>
            <CardContent className='text-muted-foreground py-12 text-center text-sm'>
              You are not a member of any organization yet. Wait for an
              invitation.
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {memberships.map(({ organization, role }) => (
              <Link
                key={organization.slug}
                href={`/tenant/${organization.slug}`}
              >
                <Card className='hover:bg-muted/50 transition-colors'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>
                      {organization.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground text-xs capitalize'>
                      Role: {role}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
