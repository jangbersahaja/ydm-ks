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

  // Staff counter routes: /staff/<slug>. The login page itself is open.
  if (pathname.startsWith("/staff/")) {
    const [, , slug] = pathname.split("/");
    if (
      slug &&
      pathname !== `/staff/${slug}/login` &&
      !request.cookies.has("ks_staff")
    ) {
      return NextResponse.redirect(
        new URL(`/staff/${slug}/login`, request.url),
      );
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
    "/staff/:path*",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/rewards/:path*",
    "/history/:path*",
    "/profile/:path*",
  ],
};
