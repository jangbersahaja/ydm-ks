import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_PATHS = [
  "/dashboard",
  "/tasks",
  "/rewards",
  "/history",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!request.cookies.has("ks_admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (CUSTOMER_PATHS.some((p) => pathname.startsWith(p))) {
    if (!request.cookies.has("ks_customer")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/rewards/:path*",
    "/history/:path*",
    "/profile/:path*",
  ],
};
