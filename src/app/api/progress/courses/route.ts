import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's enrollments with detailed progress
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: {
                id: true
              }
            },
            quizzes: {
              select: {
                id: true,
                attempts: {
                  where: {
                    studentId: userId,
                    submittedAt: { not: null }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const courseProgress = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons.length
      const completedLessons = Math.floor((enrollment.progress / 100) * totalLessons)
      
      const totalQuizzes = enrollment.course.quizzes.length
      const completedQuizzes = enrollment.course.quizzes.filter(quiz => 
        quiz.attempts.length > 0
      ).length

      return {
        courseId: enrollment.course.id,
        courseName: enrollment.course.title,
        progress: enrollment.progress,
        completedLessons,
        totalLessons,
        completedQuizzes,
        totalQuizzes,
        lastAccessed: enrollment.updatedAt.toISOString()
      }
    })

    return NextResponse.json(courseProgress)
  } catch (error) {
    console.error('Error fetching course progress:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}