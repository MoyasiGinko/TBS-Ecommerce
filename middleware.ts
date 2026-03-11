import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("app_role")?.value;

  if (pathname === "/signin" || pathname === "/signup") {
    if (role) {
      return NextResponse.redirect(new URL("/my-account", request.url));
    }

    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isAllowed = role === "admin" || role === "manager";

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/signin", "/signup"],
};
