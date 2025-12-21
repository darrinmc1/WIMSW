import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check admin routes - require ADMIN role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (token.role !== 'ADMIN') {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/market-research/:path*",
    "/history/:path*",
    "/checkout/:path*",
    "/success/:path*",
    "/admin/:path*", // Protect admin routes
    "/dashboard/:path*",
  ],
};
