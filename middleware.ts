import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isTeacher = token?.role === "TEACHER"
    const isStudent = token?.role === "STUDENT"
    const isParent = token?.role === "PARENT"

    const { pathname } = req.nextUrl

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Teacher routes
    if (pathname.startsWith("/teacher")) {
      if (!isTeacher && !isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Parent routes
    if (pathname.startsWith("/parent")) {
      if (!isParent && !isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Student-only actions
    if (pathname.includes("/enroll") || pathname.includes("/submit")) {
      if (!isStudent) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/admin/:path*",
    "/api/((?!auth|health).*)"
  ]
}