import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { EnrollmentStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courseId = (await params).id

    // Check if course exists and is published
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar di kursus ini" },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        courseId,
        studentId: session.user.id,
        status: EnrollmentStatus.PENDING
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}