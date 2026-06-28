import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import TenantLoginForm from './login-form';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function IngresoPage({ params }: Props) {
  const { slug: tenantSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { name: true }
  });

  const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`;

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <div className='w-full max-w-sm'>
        <Suspense>
          <TenantLoginForm
            orgName={org?.name}
            tenantSlug={tenantSlug}
            recoveryUrl={recoveryUrl}
          />
        </Suspense>
      </div>
    </div>
  );
}
