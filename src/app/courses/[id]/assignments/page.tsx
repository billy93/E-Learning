'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react'
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
  }
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'STUDENT') {
      router.push('/dashboard')
      return
    }

    fetchAssignments()
  }, [status, session, router])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/student`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tugas</h1>
        <p className="text-gray-600">Lihat dan kumpulkan tugas untuk kursus ini</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada tugas</h3>
            <p className="text-gray-600">Belum ada tugas yang tersedia untuk kursus ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submissionStatus = getSubmissionStatus(assignment.submission)
            const overdue = isOverdue(assignment.dueAt)
            const Icon = submissionStatus.icon

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      {assignment.description && (
                        <CardDescription className="mt-2">
                          {assignment.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={submissionStatus.variant} className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {submissionStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
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
                    {assignment.submission?.submittedAt && (
                      <div className="flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Dikumpulkan: {new Date(assignment.submission.submittedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
                      <Button variant="outline" size="sm">
                        Lihat Detail
                      </Button>
                    </Link>
                    
                    {assignment.visibility === 'PUBLISHED' && (
                      <Link href={`/courses/${courseId}/assignments/${assignment.id}/submit`}>
                        <Button size="sm" disabled={overdue && !assignment.submission}>
                          {assignment.submission ? 'Perbarui Pengumpulan' : 'Kumpulkan Tugas'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}