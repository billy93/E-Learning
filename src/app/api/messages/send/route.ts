import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { toId, body: messageBody } = body

    if (!toId || !messageBody?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fromId = session.user.id

    // Create message
    const message = await db.message.create({
      data: {
        fromId,
        toId,
        body: messageBody.trim()
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
      }
    })

    // Create notification for recipient
    await db.notification.create({
      data: {
        userId: toId,
        title: "Pesan Baru",
        body: `Anda menerima pesan baru dari ${message.from.name}`,
        readAt: null
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}