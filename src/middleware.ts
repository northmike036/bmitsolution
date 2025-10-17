// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // If no token and not already on login page → redirect to login
  if (!token && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is signed in and on root ("/") → redirect based on role
  if (token && req.nextUrl.pathname === "/") {
    const role = token.type;
    if (role === "root")
      return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "poster")
      return NextResponse.redirect(new URL("/poster", req.url));
    if (role === "seller")
      return NextResponse.redirect(new URL("/seller", req.url));
    if (role === "sellerAdmin")
      return NextResponse.redirect(new URL("/seller-admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/poster/:path*",
    "/seller/:path*",
    "/seller-admin/:path*",
    "/login",
  ],
};
