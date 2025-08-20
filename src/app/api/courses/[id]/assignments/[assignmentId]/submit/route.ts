import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const textAnswer = data.get('textAnswer') as string

    let fileUrl = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'assignments')
      await mkdir(uploadDir, { recursive: true })

      const filename = `${Date.now()}-${file.name}`
      const filepath = join(uploadDir, filename)
      
      await writeFile(filepath, buffer)
      fileUrl = `/uploads/assignments/${filename}`
    }

    const existingSubmission = await db.submission.findFirst({
      where: {
        assignmentId: params.assignmentId,
        studentId: session.user.id
      }
    })

    let submission
    if (existingSubmission) {
      submission = await db.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl: fileUrl || existingSubmission.fileUrl,
          textAnswer: textAnswer || existingSubmission.textAnswer,
          submittedAt: new Date(),
          status: 'SUBMITTED'
        }
      })
    } else {
      submission = await db.submission.create({
        data: {
          assignmentId: params.assignmentId,
          studentId: session.user.id,
          fileUrl,
          textAnswer,
          submittedAt: new Date(),
          status: 'SUBMITTED'
        }
      })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Failed to submit assignment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}