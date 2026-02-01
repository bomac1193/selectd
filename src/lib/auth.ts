/**
 * NextAuth v5 Configuration
 * Authentication setup for SELECTD
 */

import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { prisma } from "./prisma";
import { ensurePlayerProfile } from "./missions";

const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // User object from database already has these fields
        (session.user as { username?: string | null }).username = (user as any).username;
        (session.user as { isCurator?: boolean }).isCurator = (user as any).isCurator || false;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Just allow sign in, profile creation happens in events.createUser
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Profile creation is optional for now
      if (user.id) {
        try {
          await ensurePlayerProfile(user.id);
        } catch (error) {
          console.warn("createUser: profile creation skipped", error);
        }
      }
    },
  },
  session: {
    strategy: "database",
  },
});

/**
 * Get current user ID from session (server-side)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}
