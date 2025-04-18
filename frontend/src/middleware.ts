import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // If the path is a public route, allow access
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (token && pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Otherwise, allow access to public routes
    return NextResponse.next()
  }

  // For all other routes, require authentication
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL(`/login`, request.url))
  }

  // User is authenticated, allow access to protected routes
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
     * - api routes (optional, remove if you want to protect API routes too)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
