import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended User type with custom fields
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    plan: "free" | "premium" | "enterprise";
    role: "user" | "admin";
  }

  /**
   * Extended Session type with custom user fields
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      plan: "free" | "premium" | "enterprise";
      role: "user" | "admin";
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
    plan: "free" | "premium" | "enterprise";
    role: "user" | "admin";
  }
}
