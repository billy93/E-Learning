import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { GradeLevel, Visibility } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gradeLevel = searchParams.get("gradeLevel") as GradeLevel
    const subject = searchParams.get("subject")
    const search = searchParams.get("search")

    const where: any = {
      visibility: Visibility.PUBLISHED
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel
    }

    if (subject) {
      where.subject = {
        contains: subject,
        mode: "insensitive"
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    }

    const courses = await db.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description, subject, gradeLevel, schoolId } = await request.json()

    if (!title || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: "Title, subject, and grade level are required" },
        { status: 400 }
      )
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        subject,
        gradeLevel,
        schoolId,
        teacherId: session.user.id,
        visibility: Visibility.DRAFT
      },
      include: {
        teacher: {
          select: {
            name: true
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

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}