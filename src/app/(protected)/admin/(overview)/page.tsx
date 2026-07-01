import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ShieldCheck, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [userCount, orgCount, adminCount, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })
  ]);

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 lg:p-10'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Platform Overview</h1>
        <p className='text-muted-foreground mt-1'>
          Monitor and manage your SaaS platform.
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{userCount}</p>
            <p className='text-muted-foreground text-xs'>Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Organizations</CardTitle>
            <Building2 className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{orgCount}</p>
            <p className='text-muted-foreground text-xs'>Active tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Admins</CardTitle>
            <ShieldCheck className='text-muted-foreground size-4' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{adminCount}</p>
            <p className='text-muted-foreground text-xs'>Platform administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <div>
        <h2 className='mb-4 text-xl font-semibold'>Recent Users</h2>
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
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
                    <th className='text-muted-foreground px-4 py-3 text-left font-medium'>
                      Verified
                    </th>
                    <th className='text-muted-foreground px-4 py-3 text-left font-medium'>
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className='border-b last:border-0'>
                      <td className='px-4 py-3 font-medium'>{u.name}</td>
                      <td className='text-muted-foreground px-4 py-3'>
                        {u.email}
                      </td>
                      <td className='px-4 py-3'>
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                          className='capitalize'
                        >
                          {u.role ?? 'user'}
                        </Badge>
                      </td>
                      <td className='px-4 py-3'>
                        <Badge
                          variant={u.emailVerified ? 'outline' : 'destructive'}
                        >
                          {u.emailVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className='text-muted-foreground px-4 py-3'>
                        {u.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
