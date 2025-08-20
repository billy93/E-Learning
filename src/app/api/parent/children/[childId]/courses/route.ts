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

    // Get course progress for the child
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: params.childId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const courseProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.courseId

        // Get lessons progress
        const [totalLessons, completedLessons] = await Promise.all([
          db.lesson.count({
            where: {
              courseId,
              visibility: 'PUBLISHED'
            }
          }),
          db.lesson.count({
            where: {
              courseId,
              visibility: 'PUBLISHED'
              // Note: In a real app, you'd track lesson completion
            }
          })
        ])

        // Get quizzes progress
        const [totalQuizzes, quizAttempts] = await Promise.all([
          db.quiz.count({
            where: {
              courseId,
              visibility: 'PUBLISHED'
            }
          }),
          db.quizAttempt.findMany({
            where: {
              quiz: {
                courseId
              },
              studentId: params.childId
            }
          })
        ])

        const completedQuizzes = quizAttempts.filter(attempt => attempt.submittedAt !== null).length

        // Get assignments progress
        const [totalAssignments, submissions] = await Promise.all([
          db.assignment.count({
            where: {
              courseId,
              visibility: 'PUBLISHED'
            }
          }),
          db.submission.findMany({
            where: {
              assignment: {
                courseId
              },
              studentId: params.childId
            }
          })
        ])

        const completedAssignments = submissions.filter(submission => submission.submittedAt !== null).length

        // Calculate average score
        const allScores = [
          ...quizAttempts.map(attempt => attempt.score),
          ...submissions.map(submission => submission.score)
        ].filter(score => score !== null && score !== undefined) as number[]

        const averageScore = allScores.length > 0 
          ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
          : 0

        // Calculate overall progress
        const totalActivities = totalLessons + totalQuizzes + totalAssignments
        const completedActivities = completedLessons + completedQuizzes + completedAssignments
        const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

        return {
          id: courseId,
          title: enrollment.course.title,
          subject: enrollment.course.subject,
          gradeLevel: enrollment.course.gradeLevel,
          teacher: enrollment.course.teacher.name,
          enrolledAt: enrollment.createdAt.toISOString(),
          progress,
          completedLessons,
          totalLessons,
          completedQuizzes,
          totalQuizzes,
          completedAssignments,
          totalAssignments,
          averageScore
        }
      })
    )

    return NextResponse.json(courseProgress)
  } catch (error) {
    console.error('Failed to fetch course progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}