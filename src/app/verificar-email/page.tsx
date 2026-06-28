import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ token?: string; callbackURL?: string }>;
};

export default async function VerificarEmailPage({ searchParams }: Props) {
  const { token, callbackURL = '/dashboard' } = await searchParams;

  if (!token) {
    redirect('/login');
  }

  redirect(
    `/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`
  );
}
