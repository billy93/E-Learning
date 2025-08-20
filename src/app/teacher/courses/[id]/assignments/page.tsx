'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, FileText } from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description?: string
  dueAt?: string
  totalPoints: number
  visibility: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  _count: {
    submissions: number
  }
}

export default function AssignmentsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'TEACHER') {
      router.push('/dashboard')
      return
    }

    fetchAssignments()
  }, [status, session, router])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/assignments`)
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

  const getStatusBadge = (visibility: string) => {
    const variants = {
      DRAFT: 'secondary',
      PUBLISHED: 'default',
      ARCHIVED: 'outline'
    } as const

    const labels = {
      DRAFT: 'Draf',
      PUBLISHED: 'Dipublikasikan',
      ARCHIVED: 'Diarsipkan'
    }

    return (
      <Badge variant={variants[visibility as keyof typeof variants]}>
        {labels[visibility as keyof typeof labels]}
      </Badge>
    )
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tugas</h1>
          <p className="text-gray-600">Kelola tugas untuk kursus ini</p>
        </div>
        <Link href={`/teacher/courses/${params.id}/assignments/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tugas Baru
          </Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada tugas</h3>
            <p className="text-gray-600 mb-4">Mulai dengan membuat tugas pertama untuk kursus ini</p>
            <Link href={`/teacher/courses/${params.id}/assignments/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Tugas
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
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
                  {getStatusBadge(assignment.visibility)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(assignment.dueAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{assignment._count.submissions} pengumpulan</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{assignment.totalPoints} poin</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/teacher/courses/${params.id}/assignments/${assignment.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/teacher/courses/${params.id}/assignments/${assignment.id}/submissions`}>
                    <Button variant="outline" size="sm">
                      Lihat Pengumpulan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}