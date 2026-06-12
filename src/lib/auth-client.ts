import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
  ac,
  owner,
  analyst,
  lawyer,
  witness,
  promoter,
  candidate
} from '@/lib/permissions';

export const authClient = createAuthClient({
  // Sin baseURL fijo: el cliente usa window.location.origin en cada llamada.
  // Con baseURL=http://localhost:3000 fijo, los subdominios de tenant
  // (bogota-2027.localhost:3000) reciben un error CORS al intentar autenticarse
  // porque el browser bloquea la petición cross-origin.
  plugins: [
    // Plugin organization — acceso a org activa, invitaciones, roles de campaña.
    // ac y roles son necesarios para que checkRolePermission tenga tipos
    // correctos y funcione en el cliente sin llamadas al servidor.
    organizationClient({
      ac,
      roles: { owner, analyst, lawyer, witness, promoter, candidate }
    }),
    // Plugin admin — acceso a panel de super admin de la plataforma
    adminClient()
  ]
});

// Re-exportar para uso directo en componentes
export const { useSession, signIn, signOut, signUp } = authClient;
