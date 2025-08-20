"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft, Eye, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { GradeLevel, Visibility } from "@prisma/client"

interface Course {
  id: string
  title: string
  description?: string
  subject: string
  gradeLevel: GradeLevel
  visibility: Visibility
  schoolId?: string
  _count: {
    enrollments: number
    lessons: number
  }
}

const gradeLevelLabels = {
  [GradeLevel.SD1]: "SD Kelas 1",
  [GradeLevel.SD2]: "SD Kelas 2",
  [GradeLevel.SD3]: "SD Kelas 3",
  [GradeLevel.SD4]: "SD Kelas 4",
  [GradeLevel.SD5]: "SD Kelas 5",
  [GradeLevel.SD6]: "SD Kelas 6",
  [GradeLevel.SMP7]: "SMP Kelas 7",
  [GradeLevel.SMP8]: "SMP Kelas 8",
  [GradeLevel.SMP9]: "SMP Kelas 9",
  [GradeLevel.SMA10]: "SMA Kelas 10",
  [GradeLevel.SMA11]: "SMA Kelas 11",
  [GradeLevel.SMA12]: "SMA Kelas 12"
}

const subjects = [
  "Matematika",
  "Bahasa Indonesia",
  "IPA",
  "IPS",
  "Bahasa Inggris",
  "PKN",
  "Seni Budaya",
  "Penjaskes",
  "Agama",
  "TIK"
]

export default function EditCoursePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    gradeLevel: "" as GradeLevel,
    visibility: Visibility.DRAFT
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        setFormData({
          title: data.title,
          description: data.description || "",
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          visibility: data.visibility
        })
      }
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.title || !formData.subject || !formData.gradeLevel) {
      setError("Judul, mata pelajaran, dan tingkat kelas wajib diisi")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat memperbarui kursus")
      } else {
        router.push("/teacher/courses")
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Kursus tidak ditemukan</h3>
          <p className="text-gray-600 mb-4">
            Kursus yang Anda cari tidak tersedia atau telah dihapus
          </p>
          <Link href="/teacher/courses">
            <Button>Kembali ke Daftar Kursus</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Kursus</h1>
            <p className="text-muted-foreground">
              Perbarui informasi kursus Anda
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Lihat
            </Button>
          </Link>
          <Badge variant={course.visibility === Visibility.PUBLISHED ? "default" : "secondary"}>
            {course.visibility === Visibility.PUBLISHED ? "Dipublikasikan" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa Terdaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.enrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.lessons}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {course.visibility === Visibility.PUBLISHED ? "Aktif" : "Draft"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kursus</CardTitle>
            <CardDescription>
              Perbarui informasi dasar tentang kursus ini
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
                <Label htmlFor="title">Judul Kursus *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Contoh: Matematika Kelas 7 Semester 1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Deskripsikan kursus ini secara singkat..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Mata Pelajaran *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Tingkat Kelas *</Label>
                  <Select value={formData.gradeLevel} onValueChange={(value) => handleChange("gradeLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(gradeLevelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visibility">Status</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleChange("visibility", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Visibility.DRAFT}>Draft</SelectItem>
                    <SelectItem value={Visibility.PUBLISHED}>Dipublikasikan</SelectItem>
                    <SelectItem value={Visibility.ARCHIVED}>Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex gap-2">
                  <Link href={`/teacher/courses/${course.id}/manage`}>
                    <Button variant="outline">
                      Kelola Konten
                    </Button>
                  </Link>
                </div>
                
                <div className="flex gap-2">
                  <Link href="/teacher/courses">
                    <Button variant="outline" type="button">
                      Batal
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}