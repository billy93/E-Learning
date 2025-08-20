"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, ArrowLeft, FileText, Video, Link, HelpCircle } from "lucide-react"
import Link from "next/link"
import { ContentType } from "@prisma/client"

const contentTypeLabels = {
  [ContentType.VIDEO]: "Video",
  [ContentType.PDF]: "PDF",
  [ContentType.ARTICLE]: "Artikel (HTML)",
  [ContentType.SLIDES]: "Presentasi (Slide)",
  [ContentType.LINK]: "Link Eksternal"
}

const contentTypeDescriptions = {
  [ContentType.VIDEO]: "Upload video pembelajaran (MP4, WebM, dll)",
  [ContentType.PDF]: "Upload dokumen PDF",
  [ContentType.ARTICLE]: "Tulis artikel dengan format HTML",
  [ContentType.SLIDES]: "Upload presentasi (PPT, PDF, dll)",
  [ContentType.LINK]: "Link ke resource eksternal"
}

export default function NewLessonPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [formData, setFormData] = useState({
    title: "",
    contentType: "" as ContentType,
    contentUrl: "",
    contentHtml: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.title || !formData.contentType) {
      setError("Judul dan tipe konten wajib diisi")
      setIsLoading(false)
      return
    }

    // For certain content types, URL is required
    if ([ContentType.VIDEO, ContentType.PDF, ContentType.SLIDES, ContentType.LINK].includes(formData.contentType) && !formData.contentUrl) {
      setError("URL konten wajib diisi untuk tipe ini")
      setIsLoading(false)
      return
    }

    // For article, HTML content is required
    if (formData.contentType === ContentType.ARTICLE && !formData.contentHtml) {
      setError("Konten HTML wajib diisi untuk artikel")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          contentType: formData.contentType,
          contentUrl: formData.contentUrl || null,
          contentHtml: formData.contentHtml || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat membuat pelajaran")
      } else {
        router.push(`/teacher/courses/${courseId}/manage`)
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/teacher/courses/${courseId}/manage`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pelajaran Baru</h1>
          <p className="text-muted-foreground">
            Buat pelajaran baru untuk kursus Anda
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelajaran</CardTitle>
            <CardDescription>
              Isi informasi tentang pelajaran yang ingin Anda buat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Judul Pelajaran *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Contoh: Pengenalan Aljabar"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Tipe Konten *</Label>
                <Select value={formData.contentType} onValueChange={(value) => handleChange("contentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe konten" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.contentType && (
                  <p className="text-sm text-gray-600">
                    {contentTypeDescriptions[formData.contentType]}
                  </p>
                )}
              </div>
              
              {formData.contentType && [ContentType.VIDEO, ContentType.PDF, ContentType.SLIDES, ContentType.LINK].includes(formData.contentType) && (
                <div className="space-y-2">
                  <Label htmlFor="contentUrl">URL Konten *</Label>
                  <Input
                    id="contentUrl"
                    value={formData.contentUrl}
                    onChange={(e) => handleChange("contentUrl", e.target.value)}
                    placeholder="https://example.com/content.mp4"
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Masukkan URL ke file video, PDF, slide, atau link eksternal
                  </p>
                </div>
              )}
              
              {formData.contentType === ContentType.ARTICLE && (
                <div className="space-y-2">
                  <Label htmlFor="contentHtml">Konten Artikel *</Label>
                  <Textarea
                    id="contentHtml"
                    value={formData.contentHtml}
                    onChange={(e) => handleChange("contentHtml", e.target.value)}
                    placeholder="<h1>Judul Artikel</h1><p>Konten artikel...</p>"
                    rows={10}
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Tulis konten artikel menggunakan format HTML. Anda bisa menggunakan tag HTML dasar seperti h1, h2, p, strong, em, dll.
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informasi Penting</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pelajaran akan dibuat dengan status "Draft"</li>
                  <li>• Anda bisa mengubah status menjadi "Published" setelah selesai</li>
                  <li>• Urutan pelajaran akan diatur otomatis</li>
                  <li>• Pastikan konten sudah sesuai sebelum dipublikasikan</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href={`/teacher/courses/${courseId}/manage`}>
                  <Button variant="outline" type="button">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Buat Pelajaran
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}