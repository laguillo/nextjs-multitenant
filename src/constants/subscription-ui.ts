// ─────────────────────────────────────────────────────────────────────────────
// Configuración de UI para estados de suscripción
// Separado de plans.ts para no importar librerías de cliente en auth.ts
// ─────────────────────────────────────────────────────────────────────────────

import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  active: {
    label: 'Activa',
    variant: 'default' as const,
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  trialing: {
    label: 'Período de prueba',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  past_due: {
    label: 'Pago vencido',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  canceled: {
    label: 'Cancelada',
    variant: 'outline' as const,
    icon: XCircle,
    color: 'text-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200'
  },
  inactive: {
    label: 'Inactiva',
    variant: 'outline' as const,
    icon: XCircle,
    color: 'text-slate-400',
    bg: 'bg-slate-50',
    border: 'border-slate-200'
  }
} as const;

export type SubscriptionStatus = keyof typeof STATUS_CONFIG;
