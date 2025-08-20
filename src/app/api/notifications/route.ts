import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const notifications = await db.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Determine notification type based on title/content
    const notificationsWithType = notifications.map(notification => {
      let type: 'message' | 'course' | 'assignment' | 'grade' | 'system' = 'system'
      
      if (notification.title.toLowerCase().includes('pesan') || notification.body?.toLowerCase().includes('pesan')) {
        type = 'message'
      } else if (notification.title.toLowerCase().includes('kursus') || notification.body?.toLowerCase().includes('kursus')) {
        type = 'course'
      } else if (notification.title.toLowerCase().includes('tugas') || notification.body?.toLowerCase().includes('tugas')) {
        type = 'assignment'
      } else if (notification.title.toLowerCase().includes('nilai') || notification.body?.toLowerCase().includes('nilai')) {
        type = 'grade'
      }
      
      return {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        isRead: notification.readAt !== null,
        createdAt: notification.createdAt.toISOString(),
        type
      }
    })

    return NextResponse.json(notificationsWithType)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}