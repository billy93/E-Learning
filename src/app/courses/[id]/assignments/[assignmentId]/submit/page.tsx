'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description?: string
  dueAt?: string
  totalPoints: number
  visibility: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

interface Submission {
  id: string
  fileUrl?: string
  textAnswer?: string
  submittedAt?: string
}

export default function SubmitAssignmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const assignmentId = params.assignmentId as string
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [textAnswer, setTextAnswer] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'STUDENT') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/assignments/${assignmentId}`),
        fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submission`)
      ])

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json()
        setAssignment(assignmentData)
      }

      if (submissionRes.ok) {
        const submissionData = await submissionRes.json()
        setSubmission(submissionData)
        if (submissionData.textAnswer) {
          setTextAnswer(submissionData.textAnswer)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('textAnswer', textAnswer)

      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push(`/courses/${courseId}/assignments/${assignmentId}`)
      } else {
        const error = await response.json()
        console.error('Failed to submit assignment:', error)
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false
    return new Date() > new Date(dueAt)
  }

  if (fetching) {
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

  const overdue = isOverdue(assignment.dueAt)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/courses/${courseId}/assignments/${assignmentId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Detail Tugas
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kumpulkan Tugas</CardTitle>
          <CardDescription>
            {assignment.title}
            {overdue && (
              <div className="flex items-center text-red-600 mt-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Tugas ini sudah melewati batas waktu pengumpulan
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Opsional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {file ? file.name : 'Klik untuk upload file atau drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
                  </p>
                </label>
              </div>
              {submission?.fileUrl && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">File sebelumnya:</p>
                  <a 
                    href={submission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Lihat file yang diupload sebelumnya
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="textAnswer">Jawaban Teks (Opsional)</Label>
              <Textarea
                id="textAnswer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Masukkan jawaban teks Anda di sini..."
                rows={6}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Catatan Penting</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pastikan Anda telah memeriksa kembali jawaban Anda sebelum mengumpulkan. 
                    Pengumpulan dapat diperbarui selama tugas belum dinilai oleh guru.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading || overdue}>
                <FileText className="w-4 h-4 mr-2" />
                {loading ? 'Mengumpulkan...' : 'Kumpulkan Tugas'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/courses/${courseId}/assignments/${assignmentId}`}>
                  Batal
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}