import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define auth routes that don't require authentication
const authRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route) || pathname === route)

  // If it's an auth route and user is logged in, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If it's not an auth route and user is not logged in, redirect to login
  if (!isAuthRoute && !token && !pathname.startsWith("/api")) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
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
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
