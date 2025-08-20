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

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || '1')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Sample events data - in a real app, this would come from database
    const sampleEvents = [
      {
        id: '1',
        title: 'Kelas Matematika',
        description: 'Pembelajaran tentang aljabar linear',
        startTime: new Date(year, month - 1, 5, 9, 0).toISOString(),
        endTime: new Date(year, month - 1, 5, 10, 30).toISOString(),
        type: 'class',
        location: 'Ruang 101',
        courseName: 'Matematika Dasar',
        isOnline: false
      },
      {
        id: '2',
        title: 'Meeting Tim Pengajar',
        description: 'Diskusi kurikulum semester baru',
        startTime: new Date(year, month - 1, 8, 14, 0).toISOString(),
        endTime: new Date(year, month - 1, 8, 15, 30).toISOString(),
        type: 'meeting',
        location: 'Zoom Meeting',
        isOnline: true
      },
      {
        id: '3',
        title: 'Deadline Tugas Fisika',
        description: 'Pengumpulan laporan praktikum',
        startTime: new Date(year, month - 1, 12, 23, 59).toISOString(),
        endTime: new Date(year, month - 1, 12, 23, 59).toISOString(),
        type: 'assignment',
        courseName: 'Fisika Dasar'
      },
      {
        id: '4',
        title: 'Ujian Tengah Semester',
        description: 'UTS Kimia Organik',
        startTime: new Date(year, month - 1, 15, 8, 0).toISOString(),
        endTime: new Date(year, month - 1, 15, 10, 0).toISOString(),
        type: 'exam',
        location: 'Aula Utama',
        courseName: 'Kimia Organik',
        isOnline: false
      },
      {
        id: '5',
        title: 'Workshop Teknologi',
        description: 'Pengenalan AI dalam pendidikan',
        startTime: new Date(year, month - 1, 20, 13, 0).toISOString(),
        endTime: new Date(year, month - 1, 20, 17, 0).toISOString(),
        type: 'other',
        location: 'Lab Komputer',
        isOnline: false
      },
      {
        id: '6',
        title: 'Kelas Bahasa Inggris',
        description: 'Speaking practice session',
        startTime: new Date(year, month - 1, 22, 10, 0).toISOString(),
        endTime: new Date(year, month - 1, 22, 11, 30).toISOString(),
        type: 'class',
        location: 'Ruang 205',
        courseName: 'English Conversation',
        isOnline: false
      },
      {
        id: '7',
        title: 'Presentasi Proyek',
        description: 'Presentasi final project mahasiswa',
        startTime: new Date(year, month - 1, 25, 9, 0).toISOString(),
        endTime: new Date(year, month - 1, 25, 12, 0).toISOString(),
        type: 'other',
        location: 'Auditorium',
        isOnline: false
      }
    ]

    // Filter events based on user role
    let filteredEvents = sampleEvents
    
    if (session.user.role === 'STUDENT') {
      // Students see classes, assignments, and exams
      filteredEvents = sampleEvents.filter(event => 
        ['class', 'assignment', 'exam'].includes(event.type)
      )
    } else if (session.user.role === 'TEACHER') {
      // Teachers see all events
      filteredEvents = sampleEvents
    } else if (session.user.role === 'PARENT') {
      // Parents see classes, assignments, and exams related to their children
      filteredEvents = sampleEvents.filter(event => 
        ['class', 'assignment', 'exam'].includes(event.type)
      )
    }

    return NextResponse.json(filteredEvents)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers and admins can create events
    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, startTime, endTime, type, location, courseId, isOnline } = body

    // Validate required fields
    if (!title || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime, type' },
        { status: 400 }
      )
    }

    // In a real app, you would save to database
    // For now, return success response
    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      startTime,
      endTime,
      type,
      location,
      courseId,
      isOnline: isOnline || false,
      createdBy: session.user.id
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}