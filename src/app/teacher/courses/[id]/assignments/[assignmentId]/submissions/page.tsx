'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'

interface Submission {
  id: string
  studentId: string
  student: {
    id: string
    name: string
    email: string
  }
  fileUrl?: string
  textAnswer?: string
  submittedAt?: string
  status: 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING'
  score?: number
  feedback?: string
}

interface Assignment {
  id: string
  title: string
  totalPoints: number
  dueAt?: string
}

export default function SubmissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const assignmentId = params.assignmentId as string
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null)
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'TEACHER') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [submissionsRes, assignmentRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`),
        fetch(`/api/courses/${courseId}/assignments/${assignmentId}`)
      ])

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData)
      }

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json()
        setAssignment(assignmentData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setFetching(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      SUBMITTED: 'default',
      GRADED: 'secondary',
      LATE: 'destructive',
      MISSING: 'outline'
    } as const

    const labels = {
      SUBMITTED: 'Dikumpulkan',
      GRADED: 'Dinilai',
      LATE: 'Terlambat',
      MISSING: 'Belum Dikumpulkan'
    }

    const icons = {
      SUBMITTED: FileText,
      GRADED: CheckCircle,
      LATE: Clock,
      MISSING: AlertCircle
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission.id)
    setGradeForm({
      score: submission.score?.toString() || '',
      feedback: submission.feedback || ''
    })
  }

  const saveGrade = async () => {
    if (!gradingSubmission) return

    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions/${gradingSubmission}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: parseInt(gradeForm.score),
          feedback: gradeForm.feedback
        }),
      })

      if (response.ok) {
        setGradingSubmission(null)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to save grade:', error)
    } finally {
      setLoading(false)
    }
  }

  const isLate = (submittedAt?: string, dueAt?: string) => {
    if (!submittedAt || !dueAt) return false
    return new Date(submittedAt) > new Date(dueAt)
  }

  if (fetching) {
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
      <div className="mb-6">
        <Link href={`/teacher/courses/${courseId}/assignments`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Tugas
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pengumpulan Tugas</h1>
        {assignment && (
          <div className="flex items-center gap-4 text-gray-600">
            <span>{assignment.title}</span>
            <span>•</span>
            <span>Total Poin: {assignment.totalPoints}</span>
            {assignment.dueAt && (
              <>
                <span>•</span>
                <span>Batas Waktu: {formatDate(assignment.dueAt)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada pengumpulan</h3>
            <p className="text-gray-600">Belum ada siswa yang mengumpulkan tugas ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.student.name}</CardTitle>
                    <CardDescription>{submission.student.email}</CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Waktu Pengumpulan</Label>
                    <p className="font-medium">
                      {submission.submittedAt ? formatDate(submission.submittedAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Nilai</Label>
                    <p className="font-medium">
                      {submission.score !== undefined ? `${submission.score}/${assignment?.totalPoints}` : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <p className="font-medium">
                      {submission.submittedAt && assignment?.dueAt && isLate(submission.submittedAt, assignment.dueAt) ? 'Terlambat' : 'Tepat Waktu'}
                    </p>
                  </div>
                </div>

                {submission.fileUrl && (
                  <div className="mb-4">
                    <Label className="text-gray-600">File</Label>
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Unduh File
                      </a>
                    </Button>
                  </div>
                )}

                {submission.textAnswer && (
                  <div className="mb-4">
                    <Label className="text-gray-600">Jawaban Teks</Label>
                    <div className="bg-gray-50 p-3 rounded-md mt-1">
                      <p className="text-sm whitespace-pre-wrap">{submission.textAnswer}</p>
                    </div>
                  </div>
                )}

                {submission.feedback && (
                  <div className="mb-4">
                    <Label className="text-gray-600">Feedback</Label>
                    <div className="bg-blue-50 p-3 rounded-md mt-1">
                      <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
                    </div>
                  </div>
                )}

                {gradingSubmission === submission.id ? (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="score">Nilai</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          max={assignment?.totalPoints}
                          value={gradeForm.score}
                          onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                          placeholder="Masukkan nilai"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                        placeholder="Masukkan feedback (opsional)"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveGrade} disabled={loading}>
                        Simpan Nilai
                      </Button>
                      <Button variant="outline" onClick={() => setGradingSubmission(null)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => startGrading(submission)}
                      disabled={submission.status === 'MISSING'}
                    >
                      Beri Nilai
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}