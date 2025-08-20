import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { QuestionType, Visibility } from "@prisma/client"

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

    const quizzes = await db.quiz.findMany({
      where: { courseId },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
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
    const { title, isExam, timeLimit, questions } = await request.json()

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and questions are required" },
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

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)

    // Create quiz with questions
    const quiz = await db.quiz.create({
      data: {
        courseId,
        title,
        isExam: isExam || false,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        totalPoints,
        visibility: Visibility.DRAFT,
        questions: {
          create: questions.map((q: any, index: number) => ({
            type: q.type,
            prompt: q.prompt,
            points: q.points || 1,
            order: index,
            correctText: q.type === QuestionType.SHORT_ANSWER ? q.correctText : null,
            options: q.type === QuestionType.MULTIPLE_CHOICE ? q.options?.map((opt: any, optIndex: number) => ({
              text: opt.text,
              isCorrect: opt.isCorrect || false,
              order: optIndex
            })) : undefined
          }))
        }
      }
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}