'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

export default function NewAssignmentPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${params.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const assignment = await response.json()
        router.push(`/teacher/courses/${params.id}/assignments`)
      } else {
        const error = await response.json()
        console.error('Failed to create assignment:', error)
      }
    } catch (error) {
      console.error('Failed to create assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${params.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, visibility: 'DRAFT' }),
      })

      if (response.ok) {
        router.push(`/teacher/courses/${params.id}/assignments`)
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${params.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, visibility: 'PUBLISHED' }),
      })

      if (response.ok) {
        router.push(`/teacher/courses/${params.id}/assignments`)
      }
    } catch (error) {
      console.error('Failed to publish assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/teacher/courses/${params.id}/assignments`} className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Tugas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tugas Baru</CardTitle>
          <CardDescription>
            Buat tugas baru untuk kursus ini
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
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={loading}>
                Simpan sebagai Draf
              </Button>
              <Button type="button" onClick={handlePublish} disabled={loading}>
                <Eye className="w-4 h-4 mr-2" />
                Publikasikan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}