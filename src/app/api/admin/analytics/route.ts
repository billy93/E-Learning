import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const days = parseInt(range.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total users
    const totalUsers = await db.user.count()

    // Get active users (logged in within last 7 days)
    const activeUsers = await db.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Get total courses
    const totalCourses = await db.course.count()

    // Get total enrollments
    const totalEnrollments = await db.enrollment.count()

    // Calculate completion rate
    const completedEnrollments = await db.enrollment.count({
      where: {
        progress: 100
      }
    })
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0

    // Get average grade
    const grades = await db.quizResult.findMany({
      select: {
        score: true
      }
    })
    const averageGrade = grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
      : 0

    // Get user growth data
    const userGrowth = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      
      const count = await db.user.count({
        where: {
          createdAt: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          }
        }
      })
      
      userGrowth.push({ date: dateStr, count })
    }

    // Get course popularity
    const coursePopularity = await db.course.findMany({
      select: {
        title: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // Get top performers
    const topPerformers = await db.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        name: true,
        quizResults: {
          select: {
            score: true
          }
        },
        enrollments: {
          select: {
            courseId: true
          }
        }
      },
      orderBy: {
        quizResults: {
          _avg: {
            score: 'desc'
          }
        }
      },
      take: 5
    })

    const formattedTopPerformers = topPerformers.map(student => {
      const avgGrade = student.quizResults.length > 0
        ? Math.round(student.quizResults.reduce((sum, q) => sum + q.score, 0) / student.quizResults.length)
        : 0
      const courseCount = student.enrollments.length
      
      return {
        name: student.name,
        grade: avgGrade,
        courses: courseCount
      }
    })

    const analytics = {
      totalUsers,
      activeUsers,
      totalCourses,
      totalEnrollments,
      completionRate,
      averageGrade,
      userGrowth,
      coursePopularity: coursePopularity.map(c => ({
        name: c.title,
        enrollments: c._count.enrollments
      })),
      topPerformers: formattedTopPerformers
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}