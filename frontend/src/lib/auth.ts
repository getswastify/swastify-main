import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import api from "@/lib/axios"

// Token expiration time (in seconds)
const TOKEN_EXPIRY = 60 * 60 * 24 * 7 // 7 days

/**
 * Set authentication token in an HTTP-only cookie
 */
export function setAuthToken(token: string) {
  const response = NextResponse.next()
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TOKEN_EXPIRY,
  })
  return response
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value
}

/**
 * Remove authentication token
 */
export async function removeAuthToken() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const token = await getAuthToken()
  if (!token) return false

  try {
    // Verify token with your API
    const response = await api.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.status
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Middleware to protect routes
 */
export async function authMiddleware(request: Request) {
  const token = await getAuthToken()

  if (!token) {
    return Response.redirect(new URL("/login", request.url))
  }

  try {
    // Verify token with your API
    const response = await api.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.status) {
      await removeAuthToken()
      return Response.redirect(new URL("/login", request.url))
    }
  } catch (error) {
    await removeAuthToken()
    console.error(error)
    return Response.redirect(new URL("/login", request.url))
  }
}
