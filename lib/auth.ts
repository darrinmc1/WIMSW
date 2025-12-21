import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, updateLastLogin, incrementFailedAttempts, resetFailedAttempts, isUserLocked } from "./google-sheets-db";
import { APP_CONFIG } from "./config";

// Don't import env here to avoid circular dependency issues
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and PIN required");
        }

        // Get user from Google Sheets
        const user = await getUserByEmail(credentials.email);

        if (!user) {
          throw new Error("Invalid email or PIN");
        }

        // Check if user is locked out
        if (isUserLocked(user)) {
          const lockTime = new Date(user.lockedUntil!);
          const minutesLeft = Math.ceil((lockTime.getTime() - Date.now()) / 60000);
          throw new Error(`Account locked due to too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} or contact support at ${APP_CONFIG.supportEmail}`);
        }

        // Verify PIN (password field contains hashed PIN)
        const isValidPin = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPin) {
          // Increment failed attempts
          const result = await incrementFailedAttempts(user.email);

          if (result.isLocked) {
            throw new Error(`Too many failed attempts. Account locked for ${APP_CONFIG.lockoutDurationMinutes} minutes. An email has been sent to reset your PIN. Or contact support at ${APP_CONFIG.supportEmail}`);
          } else {
            throw new Error(`Invalid PIN. ${result.attemptsLeft} attempt${result.attemptsLeft > 1 ? 's' : ''} left before lockout.`);
          }
        }

        // Reset failed attempts on successful login
        await resetFailedAttempts(user.email);

        // Update last login
        await updateLastLogin(user.email);

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          plan: user.plan,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.plan = user.plan;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.plan = token.plan;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: APP_CONFIG.sessionMaxAge,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
