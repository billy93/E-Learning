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

    // Get user's enrollments with progress
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: userId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            lessons: true,
            quizzes: {
              include: {
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
      }
    })

    // Calculate progress data
    const totalCourses = enrollments.length
    const completedCourses = enrollments.filter(e => e.progress === 100).length
    const inProgressCourses = totalCourses - completedCourses

    let totalLessons = 0
    let completedLessons = 0
    let totalQuizzes = 0
    let completedQuizzes = 0
    let totalScore = 0
    let scoredQuizzes = 0

    enrollments.forEach(enrollment => {
      totalLessons += enrollment.course.lessons.length
      completedLessons += Math.floor((enrollment.progress / 100) * enrollment.course.lessons.length)
      
      enrollment.course.quizzes.forEach(quiz => {
        totalQuizzes++
        if (quiz.attempts.length > 0) {
          completedQuizzes++
          const latestAttempt = quiz.attempts[quiz.attempts.length - 1]
          if (latestAttempt.score !== null) {
            totalScore += latestAttempt.score
            scoredQuizzes++
          }
        }
      })
    })

    const averageScore = scoredQuizzes > 0 ? Math.round(totalScore / scoredQuizzes) : 0

    // Calculate study time (mock data for now)
    const studyTime = Math.floor(Math.random() * 1000) + 500 // Random between 500-1500 minutes

    // Calculate streak (mock data for now)
    const streak = Math.floor(Math.random() * 30) + 1 // Random between 1-30 days

    const progressData = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalLessons,
      completedLessons,
      totalQuizzes,
      completedQuizzes,
      averageScore,
      studyTime,
      streak
    }

    return NextResponse.json(progressData)
  } catch (error) {
    console.error('Error fetching progress data:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}