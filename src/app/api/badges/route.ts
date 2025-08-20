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

    // Get all available badges
    const allBadges = await db.badge.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get user's earned badges
    const userBadges = await db.userBadge.findMany({
      where: {
        userId
      },
      include: {
        badge: true
      }
    })

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))

    // Format badges with earned status
    const badges = allBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id)
      return {
        id: badge.id,
        name: badge.name,
        description: badge.criteria || badge.description,
        iconUrl: badge.iconUrl,
        isEarned: earnedBadgeIds.has(badge.id),
        earnedAt: userBadge?.awardedAt?.toISOString()
      }
    })

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}