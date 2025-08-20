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

    // Get recent quiz attempts
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        studentId: params.childId
      },
      include: {
        quiz: {
          select: {
            title: true,
            course: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    // Get recent assignment submissions
    const submissions = await db.submission.findMany({
      where: {
        studentId: params.childId
      },
      include: {
        assignment: {
          select: {
            title: true,
            course: {
              select: {
                title: true
              }
            },
            dueAt: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    // Combine and format activities
    const activities: Array<{
      id: string
      type: 'lesson' | 'quiz' | 'assignment'
      title: string
      course: string
      completedAt: string
      score?: number
      status?: 'completed' | 'in_progress' | 'overdue'
    }> = []

    // Add quiz activities
    quizAttempts.forEach(attempt => {
      if (attempt.submittedAt) {
        activities.push({
          id: `quiz-${attempt.id}`,
          type: 'quiz',
          title: attempt.quiz.title,
          course: attempt.quiz.course.title,
          completedAt: attempt.submittedAt.toISOString(),
          score: attempt.score
        })
      }
    })

    // Add assignment activities
    submissions.forEach(submission => {
      if (submission.submittedAt) {
        const isOverdue = submission.assignment.dueAt && 
          new Date(submission.submittedAt) > new Date(submission.assignment.dueAt)
        
        activities.push({
          id: `assignment-${submission.id}`,
          type: 'assignment',
          title: submission.assignment.title,
          course: submission.assignment.course.title,
          completedAt: submission.submittedAt.toISOString(),
          score: submission.score,
          status: isOverdue ? 'overdue' : 'completed'
        })
      }
    })

    // Sort by completedAt date and take the most recent
    activities.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    return NextResponse.json(activities.slice(0, 20))
  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}