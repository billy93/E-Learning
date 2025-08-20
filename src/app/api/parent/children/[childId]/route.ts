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
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 })
    }

    const child = await db.user.findUnique({
      where: { id: params.childId },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    return NextResponse.json(child)
  } catch (error) {
    console.error('Failed to fetch child:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the child belongs to the parent and delete the relationship
    const deleted = await db.parentChild.deleteMany({
      where: {
        parentId: session.user.id,
        childId: params.childId
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Child removed successfully' })
  } catch (error) {
    console.error('Failed to remove child:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}