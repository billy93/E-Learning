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

    const currentUserId = session.user.id

    // Get all users except current user
    const users = await db.user.findMany({
      where: {
        id: {
          not: currentUserId
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get last message and unread count for each user
    const usersWithMessageInfo = await Promise.all(
      users.map(async (user) => {
        // Get last message
        const lastMessage = await db.message.findFirst({
          where: {
            OR: [
              { fromId: currentUserId, toId: user.id },
              { fromId: user.id, toId: currentUserId }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            body: true,
            createdAt: true
          }
        })

        // Get unread count (since Message model doesn't have readAt field, we'll count all messages from this user)
        const unreadCount = await db.message.count({
          where: {
            fromId: user.id,
            toId: currentUserId
          }
        })

        return {
          ...user,
          lastMessage: lastMessage?.body,
          lastMessageTime: lastMessage?.createdAt,
          unreadCount
        }
      })
    )

    // Sort users by last message time and unread count
    const sortedUsers = usersWithMessageInfo.sort((a, b) => {
      // Prioritize users with unread messages
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      
      // Then sort by last message time
      if (!a.lastMessageTime && !b.lastMessageTime) return 0
      if (!a.lastMessageTime) return 1
      if (!b.lastMessageTime) return -1
      
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    })

    return NextResponse.json(sortedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}