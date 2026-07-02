'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertTriangleIcon } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/custom/password-input';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import Link from 'next/link';

const schema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional()
});

type Values = z.infer<typeof schema>;

export interface LoginFormProps {
  orgName?: string;
  tenantSlug?: string;
  recoveryUrl?: string;
}

export default function TenantLoginForm({
  orgName,
  tenantSlug,
  recoveryUrl
}: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const contextError = searchParams.get('error');
  const contextErrorMsg =
    contextError === 'no-member'
      ? 'Your account does not have access to this tenant. Please contact the administrator.'
      : null;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  async function onSubmit({ email, password, rememberMe }: Values) {
    setError(null);
    setLoading(true);

    try {
      const { error, data } = await authClient.signIn.email({
        email,
        password,
        rememberMe
      });

      if (!data) {
        setError(error?.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      form.reset();
      toast.success('Welcome!');

      const from = searchParams.get('from') ?? '/';
      router.push(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className='flex flex-col gap-6'
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex flex-col gap-0.5'>
            <h1 className='text-xl leading-tight font-bold'>{orgName ?? ''}</h1>
          </div>
          <p className='text-muted-foreground text-xs text-balance'>
            Enter your email and password to access the tenant tools
          </p>

          {(error || contextErrorMsg) && (
            <Alert variant='destructive' className='mt-1 w-full'>
              <AlertTriangleIcon className='mr-2 h-4 w-4' />
              {error ?? contextErrorMsg}
            </Alert>
          )}
        </div>

        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='email'
                placeholder='email@example.com'
                autoComplete='email'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='flex items-center'>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                {recoveryUrl && (
                  <Link
                    href={recoveryUrl}
                    className='text-muted-foreground ml-auto text-xs underline-offset-4 hover:underline'
                  >
                    Forgot your password?
                  </Link>
                )}
              </div>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder='********'
                autoComplete='current-password'
                aria-invalid={fieldState.invalid}
                className='rounded-l-lg'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='rememberMe'
          control={form.control}
          render={({ field }) => (
            <Field orientation='horizontal'>
              <Checkbox
                id='rememberMe'
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor='rememberMe'>Remember me</FieldLabel>
            </Field>
          )}
        />

        <Field>
          <Button type='submit' disabled={loading} size='lg' className='w-full'>
            {loading ? <Spinner /> : 'Sign In'}
          </Button>
        </Field>

        <FieldDescription className='text-center'>
          Need access? Contact your organization administrator.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
