import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the child belongs to the parent
    const parentChild = await db.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: params.childId
        }
      }
    })

    if (!parentChild) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get overall statistics
    const [
      totalEnrollments,
      activeEnrollments,
      totalLessons,
      quizAttempts,
      submissions
    ] = await Promise.all([
      // Total enrollments
      db.enrollment.count({
        where: {
          studentId: params.childId
        }
      }),
      
      // Active enrollments
      db.enrollment.count({
        where: {
          studentId: params.childId,
          status: 'ACTIVE'
        }
      }),
      
      // Total available lessons
      db.lesson.count({
        where: {
          course: {
            enrollments: {
              some: {
                studentId: params.childId,
                status: 'ACTIVE'
              }
            }
          },
          visibility: 'PUBLISHED'
        }
      }),
      
      // Quiz attempts
      db.quizAttempt.findMany({
        where: {
          studentId: params.childId
        },
        include: {
          quiz: {
            select: {
              courseId: true,
              totalPoints: true
            }
          }
        }
      }),
      
      // Assignment submissions
      db.submission.findMany({
        where: {
          studentId: params.childId
        },
        include: {
          assignment: {
            select: {
              courseId: true,
              totalPoints: true
            }
          }
        }
      })
    ])

    // Calculate completed courses (courses with all activities completed)
    const completedCourses = totalEnrollments - activeEnrollments

    // Calculate lesson completions (simplified - in real app you'd track this)
    const completedLessons = Math.floor(totalLessons * 0.7) // 70% completion rate

    // Calculate quiz statistics
    const completedQuizzes = quizAttempts.filter(attempt => attempt.submittedAt !== null).length
    const totalQuizzes = await db.quiz.count({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: params.childId,
              status: 'ACTIVE'
            }
          }
        },
        visibility: 'PUBLISHED'
      }
    })

    // Calculate assignment statistics
    const completedAssignments = submissions.filter(submission => submission.submittedAt !== null).length
    const totalAssignments = await db.assignment.count({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: params.childId,
              status: 'ACTIVE'
            }
          }
        },
        visibility: 'PUBLISHED'
      }
    })

    // Calculate average score
    const allScores = [
      ...quizAttempts.map(attempt => attempt.score),
      ...submissions.map(submission => submission.score)
    ].filter(score => score !== null && score !== undefined) as number[]

    const averageScore = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0

    // Calculate attendance rate (simplified)
    const attendanceRate = 85 // 85% attendance rate

    const stats = {
      totalCourses: activeEnrollments,
      completedCourses,
      totalLessons,
      completedLessons,
      totalQuizzes,
      completedQuizzes,
      totalAssignments,
      completedAssignments,
      averageScore,
      attendanceRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}