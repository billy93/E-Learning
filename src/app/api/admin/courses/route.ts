import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await db.course.findMany({
      include: {
        teacher: {
          select: {
            name: true
          }
        },
        school: {
          select: {
            name: true
          }
        },
        enrollments: {
          select: {
            progress: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedCourses = courses.map(course => {
      const averageProgress = course.enrollments.length > 0
        ? Math.round(course.enrollments.reduce((sum, e) => sum + e.progress, 0) / course.enrollments.length)
        : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        gradeLevel: course.gradeLevel,
        teacherName: course.teacher.name,
        schoolName: course.school?.name,
        enrollmentCount: course._count.enrollments,
        visibility: course.visibility,
        createdAt: course.createdAt.toISOString(),
        averageProgress
      }
    })

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, level, duration, price, teacherId } = body

    if (!title || !description || !category || !level || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify teacher exists
    const teacher = await db.user.findUnique({
      where: { 
        id: teacherId,
        role: 'TEACHER'
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 400 })
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        subject: category,
        gradeLevel: level,
        duration: duration || 0,
        price: price || 0,
        teacherId,
        visibility: 'DRAFT'
      },
      include: {
        teacher: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}