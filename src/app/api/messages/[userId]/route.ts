import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const otherUserId = params.userId

    // Get messages between current user and selected user
    const messages = await db.message.findMany({
      where: {
        OR: [
          { fromId: currentUserId, toId: otherUserId },
          { fromId: otherUserId, toId: currentUserId }
        ]
      },
      include: {
        from: {
          select: {
            name: true
          }
        },
        to: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Note: Message model doesn't have readAt field, so we skip marking as read for now

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      fromId: message.fromId,
      toId: message.toId,
      fromName: message.from.name,
      toName: message.to.name,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      isRead: true // Since we don't have readAt field, we'll assume all messages are read
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}