import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied. Teacher role required.' }, { status: 403 })
    }

    // Get all students enrolled in teacher's courses
    const students = await db.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: {
          some: {
            course: {
              teacherId: session.user.id
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        enrollments: {
          where: {
            course: {
              teacherId: session.user.id
            }
          },
          select: {
            id: true,
            progress: true,
            lastAccessed: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: {
              where: {
                course: {
                  teacherId: session.user.id
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Transform the data to match the expected format
    const transformedStudents = students.map(student => ({
      ...student,
      avatar: student.image
    }))

    return NextResponse.json(transformedStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}