'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Upload, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description?: string
  dueAt?: string
  totalPoints: number
  visibility: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  submission?: {
    id: string
    status: 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING'
    score?: number
    submittedAt?: string
    fileUrl?: string
    textAnswer?: string
    feedback?: string
  }
}

export default function AssignmentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const assignmentId = params.assignmentId as string
  
  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState<Assignment | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'STUDENT') {
      router.push('/dashboard')
      return
    }

    fetchAssignment()
  }, [status, session, router])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/student`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Tidak ada batas waktu'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false
    return new Date() > new Date(dueAt)
  }

  const getSubmissionStatus = (submission?: Assignment['submission']) => {
    if (!submission) return { status: 'MISSING', label: 'Belum Dikumpulkan', icon: AlertCircle, variant: 'outline' as const }
    
    switch (submission.status) {
      case 'SUBMITTED':
        return { status: 'SUBMITTED', label: 'Dikumpulkan', icon: FileText, variant: 'default' as const }
      case 'GRADED':
        return { status: 'GRADED', label: `Dinilai (${submission.score} poin)`, icon: CheckCircle, variant: 'secondary' as const }
      case 'LATE':
        return { status: 'LATE', label: 'Terlambat', icon: Clock, variant: 'destructive' as const }
      default:
        return { status: 'MISSING', label: 'Belum Dikumpulkan', icon: AlertCircle, variant: 'outline' as const }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Tugas tidak ditemukan</h3>
            <Link href={`/courses/${courseId}/assignments`}>
              <Button>Kembali ke Tugas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const submissionStatus = getSubmissionStatus(assignment.submission)
  const overdue = isOverdue(assignment.dueAt)
  const Icon = submissionStatus.icon

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/courses/${courseId}/assignments`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Tugas
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
              <div className="flex items-center gap-4 text-gray-600 mb-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className={overdue && !assignment.submission ? 'text-red-600 font-medium' : ''}>
                    {formatDate(assignment.dueAt)}
                    {overdue && !assignment.submission && ' (Terlambat)'}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{assignment.totalPoints} poin</span>
                </div>
              </div>
            </div>
            <Badge variant={submissionStatus.variant} className="flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {submissionStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {assignment.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          )}

          {assignment.submission && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Pengumpulan Anda</h3>
              
              {assignment.submission.submittedAt && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Waktu Pengumpulan</p>
                  <p className="font-medium">{formatDate(assignment.submission.submittedAt)}</p>
                </div>
              )}

              {assignment.submission.fileUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">File</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={assignment.submission.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Upload className="w-4 h-4 mr-2" />
                      Unduh File
                    </a>
                  </Button>
                </div>
              )}

              {assignment.submission.textAnswer && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Jawaban Teks</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{assignment.submission.textAnswer}</p>
                  </div>
                </div>
              )}

              {assignment.submission.feedback && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Feedback dari Guru</p>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{assignment.submission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-6">
            {assignment.visibility === 'PUBLISHED' && (
              <Link href={`/courses/${courseId}/assignments/${assignmentId}/submit`}>
                <Button disabled={overdue && !assignment.submission}>
                  {assignment.submission ? 'Perbarui Pengumpulan' : 'Kumpulkan Tugas'}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}