import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  lastLoginMethodClient,
  organizationClient
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [adminClient(), organizationClient(), lastLoginMethodClient()]
});
