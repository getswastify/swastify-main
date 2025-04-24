export type UserRole = "USER" | "DOCTOR" | "HOSPITAL" | "ADMIN"

// Define role hierarchy (higher index = more permissions)
export const roleHierarchy: UserRole[] = ["USER", "DOCTOR", "HOSPITAL", "ADMIN"]

// Define route access by role
export const roleRoutes: Record<UserRole, string[]> = {
  USER: ["/patient"],
  DOCTOR: ["/doctor"],
  HOSPITAL: ["/hospital"],
  ADMIN: ["/admin"],
}

// Define friendly names for roles
export const roleFriendlyNames: Record<UserRole, string> = {
  USER: "Patient",
  DOCTOR: "Doctor",
  HOSPITAL: "Hospital",
  ADMIN: "Administrator",
}

/**
 * Check if a user has permission for a specific role
 * @param userRole The user's current role
 * @param requiredRole The role required for access
 * @returns boolean indicating if the user has sufficient permissions
 */
export function hasRolePermission(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false


  // Admin has access to everything
  if (userRole === "ADMIN") return true

  // For other roles, they can only access their own routes
  return userRole === requiredRole
}

/**
 * Get the dashboard route for a specific role
 * @param role The user's role
 * @returns The appropriate dashboard route
 */
export function getDashboardByRole(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "DOCTOR":
      return "/doctor/dashboard"
    case "HOSPITAL":
      return "/hospital/dashboard"
    case "USER":
    default:
      return "/patient/dashboard"
  }
}

/**
 * Get the profile route for a specific role
 * @param role The user's role
 * @returns The appropriate profile route
 */
export function getProfileRouteByRole(role?: string): string {
  switch (role) {
    case "DOCTOR":
      return "/doctor/profile"
    case "HOSPITAL":
      return "/hospital/profile"
    case "USER":
    default:
      return "/patient/profile"
  }
}

/**
 * Check if a route is accessible by a role
 * @param role The user's role
 * @param route The route to check
 * @returns boolean indicating if the route is accessible
 */
export function canAccessRoute(role: UserRole | string | undefined, route: string): boolean {
  if (!role) return false
  if (role === "ADMIN") return true // Admin can access all routes

  // Map role to route prefix
  const rolePrefix =
    role === "USER" ? "/patient" : role === "DOCTOR" ? "/doctor" : role === "HOSPITAL" ? "/hospital" : "/admin"

  // Check if the route starts with the appropriate prefix for the role
  return route.startsWith(rolePrefix)
}
