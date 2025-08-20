import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ContentType, Visibility } from "@prisma/client"

export async function GET(
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
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    if (course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const lessons = await db.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { title, contentType, contentUrl, contentHtml } = await request.json()

    if (!title || !contentType) {
      return NextResponse.json(
        { error: "Title and content type are required" },
        { status: 400 }
      )
    }

    if (!Object.values(ContentType).includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      )
    }

    // Check if course exists and user owns it
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan" },
        { status: 404 }
      )
    }

    if (course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Get the next order number
    const lastLesson = await db.lesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" }
    })

    const nextOrder = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await db.lesson.create({
      data: {
        courseId,
        title,
        contentType,
        contentUrl,
        contentHtml,
        order: nextOrder,
        visibility: Visibility.DRAFT
      }
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}