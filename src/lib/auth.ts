import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { lastLoginMethod, organization } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { passwordSchema } from '@/lib/validation';
import OrganizationInvitationEmail from '@/components/emails/organization-invitation';
import ForgotPasswordEmail from '@/components/emails/reset-password';
import VerifyEmail from '@/components/emails/verify-email';
import { member, owner } from './auth-permissions';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'DOMAIN',

  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),

  // ─── Cookies cross-subdominio ─────────────────────────────────────────────
  // Necesario para que la sesión iniciada en domain.com sea visible en
  // organization.domain.com. Sin esto el proxy siempre ve hasSession=false en
  // el subdominio y redirige al login aunque el usuario ya esté autenticado.
  //
  // En desarrollo local (ROOT_DOMAIN=localhost) NO se activa: los browsers
  // no aceptan domain=localhost en cookies, cada subdominio maneja su propia
  // cookie y el proxy optimista se salta el check (hasSession puede ser false
  // sin problema porque el layout valida la sesión real de todas formas).
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NEXT_PUBLIC_ROOT_DOMAIN !== 'localhost',
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'domain.com'
    }
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Redirigir al usuario a la página de verificación propia en lugar
      // del endpoint API de Better Auth que devuelve JSON crudo.
      const apiUrl = new URL(url);
      const token = apiUrl.searchParams.get('token') ?? '';
      const callbackURL =
        apiUrl.searchParams.get('callbackURL') ?? '/dashboard';
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`;

      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Verifica tu correo electrónico',
        react: VerifyEmail({ username: user.name, verifyUrl })
      });
    },
    sendOnSignUp: true
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: 'Restablece tu contraseña',
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email
        })
      });
    }
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === '/sign-up/email' ||
        ctx.path === '/reset-password' ||
        ctx.path === '/change-password'
      ) {
        const password =
          (ctx.body as Record<string, string>).password ??
          (ctx.body as Record<string, string>).newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError('BAD_REQUEST', {
            message: 'La contraseña no es lo suficientemente segura'
          });
        }
      }
    })
  },

  plugins: [
    // ─── Plugin organization (tenant) ─────────────────────────────────────────
    organization({
      sendInvitationEmail: async (data) => {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${data.id}`;

        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: data.email,
          subject: "You've been invited to join our organization",
          react: OrganizationInvitationEmail({
            email: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink
          })
        });
      },
      roles: {
        owner,
        member
      }
    }),
    admin(),
    lastLoginMethod(),
    nextCookies()
  ]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
