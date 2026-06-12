'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Devuelve la sesión y el usuario actual.
 * Redirige a /ingreso si no hay sesión activa.
 */
export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/ingreso');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!currentUser) {
    redirect('/ingreso');
  }

  return {
    ...session,
    currentUser
  };
};

/**
 * Devuelve todos los usuarios que NO son miembros de la organización indicada.
 * Útil para el panel de invitaciones.
 */
export const getUsersNotInOrg = async (organizationId: string) => {
  try {
    const members = await prisma.member.findMany({
      where: { organizationId },
      select: { userId: true }
    });

    const memberIds = members.map((m) => m.userId);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: memberIds.length > 0 ? memberIds : ['__none__'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    return users;
  } catch (error) {
    console.error('[getUsersNotInOrg]', error);
    return [];
  }
};

/**
 * Devuelve todos los usuarios de la plataforma.
 * Solo disponible para super admin (user.role = "admin").
 */
export const getAllUsers = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== 'admin') {
    return [];
  }

  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('[getAllUsers]', error);
    return [];
  }
};
