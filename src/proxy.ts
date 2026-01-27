import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPage = pathname === "/login";

  if (!session && !isPublicPage) {
    // Capture the original URL they wanted
    const callbackUrl = encodeURIComponent(pathname);

    // Redirect to login with the callback attached
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    );
  }

  // If IS logged in and trying to go to /login
  if (session && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
