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
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await db.submission.findFirst({
      where: {
        assignmentId: params.assignmentId,
        studentId: session.user.id
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Failed to fetch submission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}