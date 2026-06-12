import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import TenantLoginForm from './login-form';

// Acepta tanto las claves uppercase del modelo de Election ('ALCALDE', 'GOBERNADOR')
// como las lowercase del modelo de Organization ('alcaldia', 'gobernacion').
const ELECTION_LABELS: Record<string, string> = {
  ALCALDE: 'Alcaldía',
  alcaldia: 'Alcaldía',
  GOBERNADOR: 'Gobernación',
  gobernacion: 'Gobernación',
  CONCEJAL: 'Concejo',
  concejo: 'Concejo',
  DIPUTADO: 'Asamblea',
  asamblea: 'Asamblea',
  CONGRESISTA: 'Congreso',
  congreso: 'Congreso',
  PRESIDENTE: 'Presidencia',
  presidencia: 'Presidencia',
};

export default async function IngresoPage({
  params
}: PageProps<'/tenant/[slug]/ingreso'>) {
  const { slug: tenantSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { name: true, electionType: true }
  });

  const electionTypeLabel = org?.electionType
    ? (ELECTION_LABELS[org.electionType] ?? null)
    : null;

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost:3000';
  const isLocalhost = appDomain.startsWith('localhost');
  const recoveryUrl = `${isLocalhost ? 'http' : 'https'}://${appDomain}/forgot-password`;

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40 p-4'>
      <div className='w-full max-w-sm'>
        <Suspense>
          <TenantLoginForm
            orgName={org?.name}
            tenantSlug={tenantSlug}
            electionTypeLabel={electionTypeLabel}
            recoveryUrl={recoveryUrl}
          />
        </Suspense>
      </div>
    </div>
  );
}
