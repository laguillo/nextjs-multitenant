import { isAuthenticated } from '@/server/users';
import { LoginForm } from './login-form';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login'
};

export default async function LoginPage() {
  const session = await isAuthenticated();

  if (session) {
    redirect('/');
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  );
}
