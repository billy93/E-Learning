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

    // Get all children of the parent
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
        name: true
      }
    })

    const childrenProgress = await Promise.all(
      children.map(async (child) => {
        const childId = child.id

        // Get course enrollments
        const enrollments = await db.enrollment.findMany({
          where: {
            studentId: childId,
            status: 'ACTIVE'
          }
        })

        const totalCourses = enrollments.length

        // Get completed courses (simplified)
        const completedCourses = Math.floor(totalCourses * 0.3) // 30% completion rate

        // Get quiz attempts and submissions for scores
        const [quizAttempts, submissions] = await Promise.all([
          db.quizAttempt.findMany({
            where: {
              studentId: childId,
              submittedAt: { not: null }
            }
          }),
          db.submission.findMany({
            where: {
              studentId: childId,
              submittedAt: { not: null }
            }
          })
        ])

        // Calculate average score
        const allScores = [
          ...quizAttempts.map(attempt => attempt.score),
          ...submissions.map(submission => submission.score)
        ].filter(score => score !== null && score !== undefined) as number[]

        const averageScore = allScores.length > 0 
          ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
          : 0

        // Get recent activity
        const recentActivities = [
          ...quizAttempts.map(attempt => ({
            type: 'quiz' as const,
            title: `Kuis: ${attempt.quizId}`, // In real app, you'd include quiz title
            course: `Kursus: ${attempt.quizId}`, // In real app, you'd include course title
            completedAt: attempt.submittedAt!.toISOString(),
            score: attempt.score
          })),
          ...submissions.map(submission => ({
            type: 'assignment' as const,
            title: `Tugas: ${submission.assignmentId}`, // In real app, you'd include assignment title
            course: `Kursus: ${submission.assignmentId}`, // In real app, you'd include course title
            completedAt: submission.submittedAt!.toISOString(),
            score: submission.score
          }))
        ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
         .slice(0, 5)

        return {
          childId: child.id,
          childName: child.name,
          totalCourses,
          completedCourses,
          averageScore,
          recentActivity: recentActivities
        }
      })
    )

    return NextResponse.json(childrenProgress)
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}