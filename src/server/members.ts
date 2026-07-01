'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type OrgRole = 'owner' | 'member';

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
    throw new Error('Failed to add member.');
  }
};

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
      error: 'Failed to remove member.'
    };
  }
};

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
