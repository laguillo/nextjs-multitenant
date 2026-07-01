import { isAuthenticated } from '@/server/users';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck } from 'lucide-react';

export default async function TenantOverviewPage({
  params
}: PageProps<'/tenant/[slug]'>) {
  const { slug } = await params;
  const session = await isAuthenticated();
  const user = session!.user;

  const [org, memberCount, currentMember, recentMembers] = await Promise.all([
    prisma.organization.findUnique({
      where: { slug },
      select: { name: true }
    }),
    prisma.member.count({ where: { organization: { slug } } }),
    prisma.member.findFirst({
      where: { organization: { slug }, userId: user.id },
      select: { role: true }
    }),
    prisma.member.findMany({
      where: { organization: { slug } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 md:p-10'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Welcome, {user.name}!
        </h1>
        <p className='text-muted-foreground mt-1'>{org?.name}</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Members</CardTitle>
            <Users className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{memberCount}</p>
            <p className='text-muted-foreground text-xs'>
              Active organization members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Your Role</CardTitle>
            <ShieldCheck className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold capitalize'>
              {currentMember?.role ?? '—'}
            </p>
            <p className='text-muted-foreground text-xs'>
              Your role in this organization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members list */}
      <div>
        <h2 className='mb-4 text-xl font-semibold'>Members</h2>
        <Card>
          <CardContent className='p-0'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-muted-foreground px-4 py-3 text-left font-medium'>
                    Name
                  </th>
                  <th className='text-muted-foreground px-4 py-3 text-left font-medium'>
                    Email
                  </th>
                  <th className='text-muted-foreground px-4 py-3 text-left font-medium'>
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((m) => (
                  <tr key={m.id} className='border-b last:border-0'>
                    <td className='px-4 py-3 font-medium'>{m.user.name}</td>
                    <td className='text-muted-foreground px-4 py-3'>
                      {m.user.email}
                    </td>
                    <td className='px-4 py-3'>
                      <Badge
                        variant={m.role === 'owner' ? 'default' : 'secondary'}
                        className='capitalize'
                      >
                        {m.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
