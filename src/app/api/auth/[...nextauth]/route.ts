// NextAuth with Frappe Provider
// Handles authentication against Frappe/ERPNext backend

import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'frappe',
      name: 'Frappe',
      credentials: {
        baseUrl: { label: 'Frappe URL', type: 'text' },
        username: { label: 'Uporabniško ime', type: 'text' },
        password: { label: 'Geslo', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.baseUrl || !credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const baseUrl = credentials.baseUrl.replace(/\/+$/, '');
          const res = await fetch(`${baseUrl}/api/method/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usr: credentials.username,
              pwd: credentials.password,
            }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();

          // Get the set-cookie header for session management
          const setCookieHeader = res.headers.get('set-cookie');

          return {
            id: data.user || credentials.username,
            name: data.full_name || data.user || credentials.username,
            email: data.email || '',
            image: null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours (restaurant shift)
  },
  pages: {
    signIn: '/settings',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'ury-dashboard-dev-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
