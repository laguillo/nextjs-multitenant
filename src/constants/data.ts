import {
  IconAffiliate,
  IconBuilding,
  IconBuildings,
  IconChartBar,
  IconCreditCard,
  IconHelpCircle,
  IconLayout,
  IconLayout2,
  IconLock,
  IconPackage,
  IconReceipt,
  IconSettings,
  IconShieldLockFilled,
  IconUser,
  IconUserCircle,
  IconUsers
} from '@tabler/icons-react';

export const AppName = process.env.NEXT_PUBLIC_APP_NAME!;

export const FooterLinks = [
  { label: 'Acerca de', href: '/acerca-de' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Política de privacidad', href: '/privacidad' },
  { label: 'Términos de uso', href: '/terminos' }
];

// Menu principal del panel de administración
export const AdminNav = {
  navMain: [
    { title: 'Escritorio', url: '/admin/dashboard', icon: IconLayout },
    {
      title: 'Organizaciones',
      url: '/admin/organizations',
      icon: IconBuilding
    },
    { title: 'Usuarios', url: '/admin/users', icon: IconUsers },
    { title: 'Planes', url: '/admin/planes', icon: IconPackage },
    {
      title: 'Suscripciones',
      url: '/admin/subscriptions',
      icon: IconCreditCard
    },
    { title: 'Analítica', url: '/admin/analytics', icon: IconChartBar }
  ],
  navSecondary: [
    { title: 'Configuración', url: '/admin/settings', icon: IconSettings },
    { title: 'Ayuda', url: '/admin/help', icon: IconHelpCircle }
  ]
};

export const DashboardNav = {
  navMain: [
    { title: 'Resumen', url: '/dashboard/overview', icon: IconLayout2 },
    { title: 'Perfil', url: '/dashboard/profile', icon: IconUser },
    { title: 'Campañas', url: '/dashboard/campaigns', icon: IconBuildings },
    {
      title: 'Suscripción',
      url: '/dashboard/subscription',
      icon: IconAffiliate
    },
    { title: 'Facturación', url: '/dashboard/billing', icon: IconReceipt },
    { title: 'Seguridad', url: '/dashboard/security', icon: IconLock }
  ],
  navSecondary: [
    {
      title: 'Configuración',
      url: '/dashboard/settings',
      icon: IconSettings
    },
    { title: 'Ayuda', url: '/dashboard/help', icon: IconHelpCircle }
  ]
};

export const DASHBOARD_QUICK_LINKS = [
  {
    label: 'Perfil',
    description: 'Edita tu nombre e información',
    href: '/dashboard/profile',
    icon: IconUserCircle,
    color: 'bg-violet-50 text-violet-700'
  },
  {
    label: 'Campañas',
    description: 'Accede a tus organizaciones',
    href: '/dashboard/campaigns',
    icon: IconBuildings,
    color: 'bg-blue-50 text-blue-700'
  },
  {
    label: 'Suscripción',
    description: 'Estado de tu plan PIE',
    href: '/dashboard/subscription',
    icon: IconCreditCard,
    color: 'bg-emerald-50 text-emerald-700'
  },
  {
    label: 'Facturación',
    description: 'Historial de pagos',
    href: '/dashboard/billing',
    icon: IconReceipt,
    color: 'bg-amber-50 text-amber-700'
  },
  {
    label: 'Seguridad',
    description: 'Contraseña y sesiones',
    href: '/dashboard/security',
    icon: IconShieldLockFilled,
    color: 'bg-red-50 text-red-700'
  },
  {
    label: 'Configuración',
    description: 'Preferencias de cuenta',
    href: '/dashboard/settings',
    icon: IconSettings,
    color: 'bg-slate-100 text-slate-700'
  }
];
