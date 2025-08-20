import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignment = await db.assignment.findFirst({
      where: {
        id: params.assignmentId,
        courseId: params.id,
        course: {
          teacherId: session.user.id
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Failed to fetch assignment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dueAt, totalPoints, visibility } = body

    const assignment = await db.assignment.updateMany({
      where: {
        id: params.assignmentId,
        courseId: params.id,
        course: {
          teacherId: session.user.id
        }
      },
      data: {
        title,
        description,
        dueAt: dueAt ? new Date(dueAt) : null,
        totalPoints: parseInt(totalPoints),
        visibility
      }
    })

    if (assignment.count === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const updatedAssignment = await db.assignment.findUnique({
      where: { id: params.assignmentId }
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Failed to update assignment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignment = await db.assignment.deleteMany({
      where: {
        id: params.assignmentId,
        courseId: params.id,
        course: {
          teacherId: session.user.id
        }
      }
    })

    if (assignment.count === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete assignment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}