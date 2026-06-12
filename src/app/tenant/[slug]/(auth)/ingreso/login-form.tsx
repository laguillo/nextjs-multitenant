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
import { AppLogo } from '@/components/site/app-logo';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import Link from 'next/link';

const schema = z.object({
  email: z.email({ message: 'Por favor, introduce un correo válido' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria' }),
  rememberMe: z.boolean().optional()
});

type Values = z.infer<typeof schema>;

export interface LoginFormProps {
  orgName?: string;
  tenantSlug?: string;
  electionTypeLabel?: string | null;
  recoveryUrl?: string;
}

export default function TenantLoginForm({
  orgName,
  tenantSlug,
  electionTypeLabel,
  recoveryUrl
}: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const contextError = searchParams.get('error');
  const contextErrorMsg =
    contextError === 'no-member'
      ? 'Tu cuenta no tiene acceso a esta campaña. Contacta al administrador.'
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
        setError(error?.message || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      form.reset();
      toast.success('¡Bienvenid@!');

      // En el subdominio del tenant "/" es reescrito por el proxy a la raíz de
      // la campaña. No usar "/tenant/${slug}" porque el proxy lo volvería a
      // prefijar y causaría doble nesting (tenant/slug/tenant/slug).
      const from = searchParams.get('from') ?? '/';
      router.push(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal');
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
        {/* Branding */}
        <div className='flex flex-col items-center gap-3 text-center'>
          <AppLogo size={40} />
          <div className='flex flex-col gap-0.5'>
            <h1 className='text-xl leading-tight font-bold'>
              {orgName ?? 'Ingreso al equipo'}
            </h1>
            {electionTypeLabel && (
              <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                Campaña · {electionTypeLabel}
              </p>
            )}
          </div>
          <p className='text-muted-foreground text-xs text-balance'>
            Introduce tu correo y contraseña para acceder a las herramientas de
            campaña
          </p>

          {(error || contextErrorMsg) && (
            <Alert variant='destructive' className='mt-1 w-full'>
              <AlertTriangleIcon className='mr-2 h-4 w-4' />
              {error ?? contextErrorMsg}
            </Alert>
          )}
        </div>

        {/* Email */}
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Correo electrónico</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='email'
                placeholder='correo@ejemplo.com'
                autoComplete='email'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Contraseña */}
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='flex items-center'>
                <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                {recoveryUrl && (
                  <Link
                    href={recoveryUrl}
                    className='text-muted-foreground ml-auto text-xs underline-offset-4 hover:underline'
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
              </div>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder='********'
                autoComplete='current-password'
                aria-invalid={fieldState.invalid}
                className='rounded-full'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Recordarme */}
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
              <FieldLabel htmlFor='rememberMe'>Recordarme</FieldLabel>
            </Field>
          )}
        />

        <Field>
          <Button type='submit' disabled={loading} size='lg' className='w-full'>
            {loading ? <Spinner /> : 'Ingresar'}
          </Button>
        </Field>

        <FieldDescription className='text-center'>
          ¿Necesitas acceso? Contacta al administrador de la campaña.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
