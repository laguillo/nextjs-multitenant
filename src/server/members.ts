'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type OrgRole =
  | 'owner'
  | 'analyst'
  | 'lawyer'
  | 'witness'
  | 'promoter'
  | 'candidate';

/**
 * Agrega un miembro a una organización usando la API de Better Auth.
 * El rol debe ser uno de los 6 roles electorales.
 */
export const addMember = async (
  organizationId: string,
  userId: string,
  role: OrgRole
) => {
  try {
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role
      }
    });
  } catch (error) {
    console.error('[addMember]', error);
    throw new Error('No se pudo agregar el miembro.');
  }
};

/**
 * Elimina un miembro de una organización.
 * Acepta el ID del miembro o su email.
 */
export const removeMember = async (
  memberIdOrEmail: string,
  organizationId?: string
) => {
  try {
    await auth.api.removeMember({
      headers: await headers(),
      body: { memberIdOrEmail, organizationId }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('[removeMember]', error);
    return {
      success: false,
      error: 'No se pudo eliminar el miembro.'
    };
  }
};

/**
 * Devuelve todos los miembros de una organización con datos de usuario.
 */
export const getMembersByOrg = async (organizationId: string) => {
  try {
    const members = await prisma.member.findMany({
      where: { organizationId },
      include: { user: true }
    });
    return members;
  } catch (error) {
    console.error('[getMembersByOrg]', error);
    return [];
  }
};

/**
 * Devuelve el miembro activo de la sesión actual dentro de una organización.
 */
export const getCurrentMember = async (organizationId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId
    }
  });
};
