import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { Provider } from 'next-auth/providers';

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
  // Explicitly set secret (NextAuth v5 reads AUTH_SECRET by default, not NEXTAUTH_SECRET)
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
