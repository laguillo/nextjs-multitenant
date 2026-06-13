import { betterAuth } from 'better-auth';
import { admin, organization } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  plugins: [admin(), organization(), nextCookies()]
});
