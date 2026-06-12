import { betterAuth } from 'better-auth';
import { i18n } from '@better-auth/i18n';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { organization } from 'better-auth/plugins/organization';
import { admin } from 'better-auth/plugins/admin';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { Resend } from 'resend';

import prisma from '@/lib/prisma';
import {
  ac,
  owner,
  analyst,
  lawyer,
  witness,
  promoter,
  candidate
} from '@/lib/permissions';
import { passwordSchema } from '@/lib/validation';
import { getPlanMaxOrgs } from '@/constants/plans';
import OrganizationInvitationEmail from '@/components/emails/organization-invitation';
import ForgotPasswordEmail from '@/components/emails/reset-password';
import VerifyEmail from '@/components/emails/verify-email';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'DOMAIN',

  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),

  // ─── Cookies cross-subdominio ─────────────────────────────────────────────
  // Necesario para que la sesión iniciada en pie.com sea visible en
  // campaña.pie.com. Sin esto el proxy siempre ve hasSession=false en
  // el subdominio y redirige al login aunque el usuario ya esté autenticado.
  //
  // En desarrollo local (ROOT_DOMAIN=localhost) NO se activa: los browsers
  // no aceptan domain=localhost en cookies, cada subdominio maneja su propia
  // cookie y el proxy optimista se salta el check (hasSession puede ser false
  // sin problema porque el layout valida la sesión real de todas formas).
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NEXT_PUBLIC_ROOT_DOMAIN !== 'localhost',
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'pie.com'
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
    requireEmailVerification: false,
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

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url
      }: {
        user: { name: string; email: string };
        newEmail: string;
        url: string;
      }) => {
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: user.email,
          subject: 'Confirma tu nuevo correo electrónico',
          text: `Hola ${user.name},\n\nHas solicitado cambiar tu correo electrónico a ${newEmail}. Por favor, haz clic en el siguiente enlace para confirmar este cambio:\n\n${url}\n\nSi no solicitaste este cambio, puedes ignorar este correo electrónico.`
        });
      }
    },
    additionalFields: {
      // Usado por el plugin admin — "admin" = super admin de la plataforma
      role: {
        type: 'string',
        input: false
      }
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
    i18n({
      translations: {
        es: {
          USER_NOT_FOUND:
            'No se encontró un usuario con ese correo electrónico',
          INVALID_EMAIL_OR_PASSWORD:
            'Correo electrónico o contraseña inválidos',
          INVALID_PASSWORD: 'Contraseña inválida'
        }
      }
    }),
    // ─── Plugin organization (tenant) ─────────────────────────────────────────
    // Cada campaña política es una Organization.
    // El creador queda como "owner". Los 6 roles electorales se definen aquí.
    organization({
      // Solo usuarios con suscripción activa y con rol "admin" o "user" pueden crear una organización.
      // El límite de campañas lo define el plan contratado (maxOrganizations en PLANS).
      allowUserToCreateOrganization: async (user) => {
        // Buscar todas las orgs del usuario y verificar si alguna tiene
        // suscripción activa con cupo disponible para nuevas organizaciones
        const memberships = await prisma.member.findMany({
          where: { userId: user.id },
          select: {
            organization: {
              select: {
                subscription: {
                  select: { planId: true, status: true, maxOrganizations: true }
                }
              }
            }
          }
        });

        // Buscar la primera suscripción activa del usuario
        const activeSub = memberships
          .flatMap((m) =>
            m.organization.subscription ? [m.organization.subscription] : []
          )
          .find((s) => s.status === 'ACTIVE' || s.status === 'TRIALING');

        if (!activeSub) return false;

        // Límite según el plan contratado (fallback: 1 si no existe en DB)
        // maxOrganizations del Subscription tiene precedencia sobre el del Plan
        const max =
          activeSub.maxOrganizations !== 1
            ? activeSub.maxOrganizations
            : await getPlanMaxOrgs(activeSub.planId);
        const owned = await prisma.member.count({
          where: { userId: user.id, role: 'owner' }
        });
        return max === -1 || owned < max;
      },

      creatorRole: 'owner', // Propietario de la campaña, con todos los permisos

      // Access controller compartido + 6 roles electorales
      ac,
      roles: { owner, analyst, lawyer, witness, promoter, candidate },

      // Envío de invitaciones por email
      sendInvitationEmail: async (data) => {
        const inviterUser = data.inviter.user;
        await resend.emails.send({
          from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
          to: data.email,
          subject: `Invitación a ${data.organization.name}`,
          react: OrganizationInvitationEmail({
            email: data.email,
            invitedByUsername: inviterUser.name ?? inviterUser.email,
            invitedByEmail: inviterUser.email,
            teamName: data.organization.name,
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${data.id}`
          })
        });
      },

      // Campos adicionales en Organization (se completan al configurar la elección)
      schema: {
        organization: {
          additionalFields: {
            electionType: {
              type: 'string',
              required: false
            },
            subscriptionStatus: {
              type: 'string',
              required: false, // Indica si la campaña tiene una suscripción activa.
              defaultValue: 'inactive'
            }
          }
        }
      }
    }),

    // ─── Plugin admin (plataforma) ────────────────────────────────────────────
    // user.role = "admin" → super admin con acceso total a la plataforma SaaS.
    // user.role = "user"  → cliente normal.
    admin({
      ac,
      adminRoles: ['admin']
    }),
    nextCookies()
  ]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
