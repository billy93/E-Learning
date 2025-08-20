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

    const schools = await db.school.findMany({
      include: {
        _count: {
          select: {
            users: true,
            courses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedSchools = schools.map(school => ({
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      type: school.type,
      studentCount: school._count.users.filter(u => u.role === 'STUDENT').length,
      teacherCount: school._count.users.filter(u => u.role === 'TEACHER').length,
      courseCount: school._count.courses,
      isActive: school.isActive,
      createdAt: school.createdAt.toISOString()
    }))

    return NextResponse.json(formattedSchools)
  } catch (error) {
    console.error('Error fetching schools:', error)
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
    const { name, address, phone, email, type } = body

    if (!name || !address || !phone || !email || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if school already exists
    const existingSchool = await db.school.findFirst({
      where: {
        OR: [
          { name },
          { email }
        ]
      }
    })

    if (existingSchool) {
      return NextResponse.json({ error: "School already exists" }, { status: 400 })
    }

    const school = await db.school.create({
      data: {
        name,
        address,
        phone,
        email,
        type,
        isActive: true
      }
    })

    return NextResponse.json(school, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}