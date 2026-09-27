import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { Provider } from 'next-auth/providers';
import { CredentialsSignin } from 'next-auth';

// Build providers list dynamically — only add Google if credentials exist
const providers: Provider[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
          return user;
        }
        return null;
      } catch (error) {
        console.error("Authentication Database Error:", error);
        // Throw a specific error we can identify in the UI
        class DatabaseError extends CredentialsSignin { code = "DatabaseError" };
        throw new DatabaseError();
      }
    },
  }),
];

// Only register Google OAuth if both env vars are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  // Required for Vercel deployment — trusts the proxy headers
  trustHost: true,
  // Fallback to multiple potential environment variables for safety
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-insightai-development-only-12345',
  debug: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Allow all OAuth sign-ins and credential sign-ins
      if (account?.provider === 'google') {
        // Ensure user has a name for Google OAuth
        if (!user.name) {
          user.name = user.email?.split('@')[0] || 'User';
        }

        // Manually link the account if the user already exists in the database
        // This prevents the 'OAuthAccountNotLinked' error when a user signed up with Credentials first.
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (existingUser) {
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId
              }
            });
            
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              });
            }
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
        token.hasCompletedOnboarding = (user as any).hasCompletedOnboarding || false;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).hasCompletedOnboarding = token.hasCompletedOnboarding as boolean;
      }
      return session;
    },
  },
});
