import { isAuthenticated } from '@/server/users';

export default async function TenantOverviewPage() {
  const session = await isAuthenticated();
  const user = session!.user;

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 md:p-10'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
          Welcome back, {user.name}!
        </h1>
        <p className='text-muted-foreground'>
          Here&apos;s what&apos;s happening with your organization today.
        </p>
      </div>
    </div>
  );
}
