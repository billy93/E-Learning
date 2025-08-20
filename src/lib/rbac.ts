import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { Role } from "@prisma/client"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role as Role)) {
    throw new Error("Insufficient permissions")
  }
  return user
}

export async function requireTeacher() {
  return await requireRole([Role.TEACHER, Role.ADMIN])
}

export async function requireStudent() {
  return await requireRole([Role.STUDENT])
}

export async function requireParent() {
  return await requireRole([Role.PARENT])
}

export async function requireAdmin() {
  return await requireRole([Role.ADMIN])
}

export function hasRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole)
}