'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description?: string
  dueAt?: string
  totalPoints: number
  visibility: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export default function EditAssignmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const assignmentId = params.assignmentId as string
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueAt: '',
    totalPoints: 100,
    visibility: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
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

    fetchAssignment()
  }, [status, session, router])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
        setFormData({
          title: data.title,
          description: data.description || '',
          dueAt: data.dueAt ? new Date(data.dueAt).toISOString().slice(0, 16) : '',
          totalPoints: data.totalPoints,
          visibility: data.visibility
        })
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/teacher/courses/${courseId}/assignments`)
      } else {
        const error = await response.json()
        console.error('Failed to update assignment:', error)
      }
    } catch (error) {
      console.error('Failed to update assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(`/teacher/courses/${courseId}/assignments`)
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error)
    } finally {
      setLoading(false)
    }
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
            <Link href={`/teacher/courses/${courseId}/assignments`}>
              <Button>Kembali ke Tugas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/teacher/courses/${courseId}/assignments`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Tugas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Tugas</CardTitle>
          <CardDescription>
            Perbarui informasi tugas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tugas</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul tugas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi tugas (opsional)"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueAt">Batas Waktu</Label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints">Total Poin</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  min="1"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Status</Label>
              <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draf</SelectItem>
                  <SelectItem value="PUBLISHED">Dipublikasikan</SelectItem>
                  <SelectItem value="ARCHIVED">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Tugas
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}