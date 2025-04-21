import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Also check localStorage token as a fallback (for client-side auth)
  const localToken = request.headers.get("x-auth-token")

  // If it's a protected route and user is not logged in, redirect to login
  if (!isPublicRoute && !token && !localToken) {
    const url = new URL("/login", request.url)
    // Only add redirect param if not already on login page
    if (pathname !== "/login") {
      url.searchParams.set("redirect", pathname)
    }
    return NextResponse.redirect(url)
  }

  // If it's a login/register page and user is logged in, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && (token || localToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
  ],
}
