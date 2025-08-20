import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await db.assignment.findMany({
      where: {
        courseId: params.id,
        visibility: 'PUBLISHED'
      },
      include: {
        submission: {
          where: {
            studentId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Failed to fetch assignments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}