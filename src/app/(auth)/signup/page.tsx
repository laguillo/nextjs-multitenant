import { SignupForm } from './signup-form';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { isAuthenticated } from '@/server/users';

export const metadata: Metadata = {
  title: 'Sign Up'
};

export default async function SignUpPage() {
  const session = await isAuthenticated();

  if (session) {
    redirect('/');
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <SignupForm />
      </div>
    </div>
  );
}
