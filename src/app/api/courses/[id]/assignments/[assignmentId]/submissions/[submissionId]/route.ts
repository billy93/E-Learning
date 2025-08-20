import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string; submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { score, feedback } = body

    const submission = await db.submission.updateMany({
      where: {
        id: params.submissionId,
        assignment: {
          id: params.assignmentId,
          courseId: params.id,
          course: {
            teacherId: session.user.id
          }
        }
      },
      data: {
        score: score !== null ? parseInt(score) : null,
        feedback,
        status: 'GRADED'
      }
    })

    if (submission.count === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const updatedSubmission = await db.submission.findUnique({
      where: { id: params.submissionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Failed to update submission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}