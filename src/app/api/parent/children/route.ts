import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const children = await db.user.findMany({
      where: {
        parentChildren: {
          some: {
            parentId: session.user.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(children)
  } catch (error) {
    console.error('Failed to fetch children:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find the child user
    const child = await db.user.findUnique({
      where: { email },
      include: {
        parentChildren: {
          where: {
            parentId: session.user.id
          }
        }
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Anak dengan email tersebut tidak ditemukan' }, { status: 404 })
    }

    // Check if already linked
    if (child.parentChildren.length > 0) {
      return NextResponse.json({ error: 'Anak ini sudah terhubung dengan akun Anda' }, { status: 400 })
    }

    // Check if child is a student
    if (child.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Hanya akun siswa yang dapat ditambahkan' }, { status: 400 })
    }

    // Create the parent-child relationship
    const parentChild = await db.parentChild.create({
      data: {
        parentId: session.user.id,
        childId: child.id
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            email: true,
            gradeLevel: true
          }
        }
      }
    })

    return NextResponse.json(parentChild.child)
  } catch (error) {
    console.error('Failed to add child:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}