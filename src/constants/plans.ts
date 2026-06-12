// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de planes de suscripción PIE
//
// Los planes viven en la tabla `plan` de la DB (modelo Plan en schema.prisma).
// Este archivo mantiene únicamente los helpers que se usan en auth.ts (servidor),
// donde no es posible hacer queries async dentro de la configuración estática.
//
// Para mostrar planes en UI (portada, admin) hacer query directa a DB:
//   prisma.plan.findMany({ where: { isFeatured: true, isActive: true }, orderBy: { sortOrder: 'asc' } })
//
// IMPORTANTE: este archivo se importa desde auth.ts.
// No importar librerías de cliente (íconos, componentes React, etc.).
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '@/lib/prisma';

/** Retorna el label del plan consultando la DB por id. Fallback al planId si no existe. */
export async function getPlanLabel(
  planId: string | null | undefined
): Promise<string> {
  if (!planId) return '—';
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { label: true }
  });
  return plan?.label ?? planId;
}

/**
 * Retorna el máximo de organizaciones permitidas para un planId (UUID).
 * Consulta la DB; fallback a 1 si el plan no existe.
 */
export async function getPlanMaxOrgs(
  planId: string | null | undefined
): Promise<number> {
  if (!planId) return 1;
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { maxOrganizations: true }
  });
  return plan?.maxOrganizations ?? 1;
}
