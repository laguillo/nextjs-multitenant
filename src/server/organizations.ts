'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Devuelve todas las organizaciones a las que pertenece el usuario activo.
 */
export async function getOrganizations() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const members = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: { organization: true }
  });

  return members.map((m) => m.organization);
}

/**
 * Devuelve la organización activa de un usuario dado su userId.
 * Usa el primer membership encontrado como fallback (una campaña por usuario en plan básico).
 */
export async function getActiveOrganization(userId: string) {
  const member = await prisma.member.findFirst({
    where: { userId },
    include: { organization: true }
  });

  return member?.organization ?? null;
}

/**
 * Devuelve una organización por su slug, incluyendo sus miembros con datos de usuario.
 */
export async function getOrganizationBySlug(slug: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    return org;
  } catch (error) {
    console.error('[getOrganizationBySlug]', error);
    return null;
  }
}
