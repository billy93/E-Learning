import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Visibility, GradeLevel } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courseId = params.id

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lessons: {
          orderBy: {
            order: 'asc'
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check authorization - teachers can only see their own courses, admins can see all
    if (session.user.role === "TEACHER" && course.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courseId = params.id
    const { title, description, subject, gradeLevel, visibility } = await request.json()

    // Check if course exists and user owns it
    const existingCourse = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    if (existingCourse.teacherId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Validate input
    if (gradeLevel && !Object.values(GradeLevel).includes(gradeLevel)) {
      return NextResponse.json(
        { error: "Invalid grade level" },
        { status: 400 }
      )
    }

    if (visibility && !Object.values(Visibility).includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (subject !== undefined) updateData.subject = subject
    if (gradeLevel !== undefined) updateData.gradeLevel = gradeLevel
    if (visibility !== undefined) updateData.visibility = visibility

    const course = await db.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            quizzes: true,
            assignments: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courseId = params.id

    // Check if course exists and user owns it
    const existingCourse = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    if (existingCourse.teacherId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await db.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ message: "Kursus berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}