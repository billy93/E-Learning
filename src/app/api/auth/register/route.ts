import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { Role, GradeLevel } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, gradeLevel } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: "Peran tidak valid" },
        { status: 400 }
      )
    }

    // For students, grade level is required
    if (role === Role.STUDENT && !gradeLevel) {
      return NextResponse.json(
        { error: "Tingkat kelas wajib diisi untuk siswa" },
        { status: 400 }
      )
    }

    if (gradeLevel && !Object.values(GradeLevel).includes(gradeLevel)) {
      return NextResponse.json(
        { error: "Tingkat kelas tidak valid" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        gradeLevel: gradeLevel || null
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}