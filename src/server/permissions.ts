'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/**
 * Verifica si el miembro activo tiene permiso de owner sobre la elección.
 * Usado para proteger rutas del panel /admin de la organización.
 */
export const canManageElection = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          election: ['create', 'update', 'delete']
        }
      }
    });

    if (error) {
      return { success: false, error: String(error) };
    }

    return { success };
  } catch (error) {
    console.error('[canManageElection]', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Verifica si el miembro activo puede aprobar rondas de escrutinio.
 */
export const canApproveScrutiny = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          scrutiny: ['approve']
        }
      }
    });

    if (error) {
      return { success: false, error: String(error) };
    }

    return { success };
  } catch (error) {
    console.error('[canApproveScrutiny]', error);
    return { success: false, error: String(error) };
  }
};
