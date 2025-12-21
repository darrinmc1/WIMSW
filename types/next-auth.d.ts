import "next-auth";
import "next-auth/jwt";
import type { UserPlan, UserRole } from "@prisma/client";

declare module "next-auth" {
  /**
   * Extended User type with custom fields
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    plan: UserPlan;
    role: UserRole;
  }

  /**
   * Extended Session type with custom user fields
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      plan: UserPlan;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT token with custom fields
   */
  interface JWT {
    id: string;
    email: string;
    plan: UserPlan;
    role: UserRole;
  }
}
