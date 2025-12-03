import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { userName: credentials.userName },
        });

        if (!user) return null;
        if (!user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          userName: user.userName,
          type: user.type,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],

  callbacks: {
    // -----------------------------
    // JWT CALLBACK
    // -----------------------------
    async jwt({ token, user }: any) {
      // Login — store user fields in JWT
      if (user) {
        token.id = user.id;
        token.type = user.type;
        token.sessionVersion = user.sessionVersion;
        return token;
      }

      // Validate session
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { sessionVersion: true, isActive: true },
      });

      // If user removed or disabled → invalidate token
      if (!dbUser || !dbUser.isActive) {
        return { id: null, type: null, sessionVersion: null };
      }

      // If password changed → invalidate all sessions
      if (dbUser.sessionVersion !== token.sessionVersion) {
        return { id: null, type: null, sessionVersion: null };
      }

      return token;
    },

    // -----------------------------
    // SESSION CALLBACK
    // -----------------------------
    async session({ session, token }: any) {
      // Token was invalidated → logout on client
      if (!token?.id) return null;

      session.user.id = token.id;
      session.user.type = token.type;
      session.user.sessionVersion = token.sessionVersion;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
