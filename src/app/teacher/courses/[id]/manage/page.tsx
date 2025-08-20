"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Plus,
  Edit,
  Eye,
  Trash2,
  HelpCircle,
  FileText,
  Play,
  ArrowLeft,
  Settings,
  Users
} from "lucide-react"
import Link from "next/link"
import { ContentType, Visibility } from "@prisma/client"

interface Course {
  id: string
  title: string
  subject: string
  gradeLevel: string
  visibility: Visibility
  _count: {
    enrollments: number
    lessons: number
    quizzes: number
    assignments: number
  }
}

interface Lesson {
  id: string
  title: string
  contentType: ContentType
  order: number
  visibility: Visibility
  contentUrl?: string
  contentHtml?: string
}

interface Quiz {
  id: string
  title: string
  isExam: boolean
  timeLimit?: number
  totalPoints: number
  visibility: Visibility
  _count: {
    questions: number
  }
}

interface Assignment {
  id: string
  title: string
  description?: string
  dueAt?: string
  totalPoints: number
  visibility: Visibility
}

const contentTypeLabels = {
  [ContentType.VIDEO]: "Video",
  [ContentType.PDF]: "PDF",
  [ContentType.ARTICLE]: "Artikel",
  [ContentType.SLIDES]: "Slide",
  [ContentType.LINK]: "Link"
}

const contentTypeIcons = {
  [ContentType.VIDEO]: Play,
  [ContentType.PDF]: FileText,
  [ContentType.ARTICLE]: BookOpen,
  [ContentType.SLIDES]: Settings,
  [ContentType.LINK]: HelpCircle
}

export default function ManageCoursePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`)
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourse(courseData)
      }

      // Fetch lessons
      const lessonsResponse = await fetch(`/api/courses/${courseId}/lessons`)
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json()
        setLessons(lessonsData)
      }

      // Fetch quizzes
      const quizzesResponse = await fetch(`/api/courses/${courseId}/quizzes`)
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json()
        setQuizzes(quizzesData)
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(`/api/courses/${courseId}/assignments`)
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json()
        setAssignments(assignmentsData)
      }
    } catch (error) {
      console.error("Error fetching course data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pelajaran ini?")) return

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCourseData()
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
    }
  }

  const handlePublishLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/publish`, {
        method: "POST",
      })

      if (response.ok) {
        fetchCourseData()
      }
    } catch (error) {
      console.error("Error publishing lesson:", error)
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
            <h1 className="text-3xl font-bold tracking-tight">Kelola Kursus</h1>
            <p className="text-muted-foreground">
              {course.title} - {course.subject}
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
          <Link href={`/teacher/courses/${course.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Badge variant={course.visibility === "PUBLISHED" ? "default" : "secondary"}>
            {course.visibility === "PUBLISHED" ? "Dipublikasikan" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.enrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.lessons}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuis</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.quizzes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.assignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management */}
      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Pelajaran</TabsTrigger>
          <TabsTrigger value="quizzes">Kuis</TabsTrigger>
          <TabsTrigger value="assignments">Tugas</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Pelajaran</h2>
            <Link href={`/teacher/courses/${courseId}/lessons/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pelajaran
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => {
                const Icon = contentTypeIcons[lesson.contentType]
                return (
                  <Card key={lesson.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {contentTypeLabels[lesson.contentType]}
                              </Badge>
                              <Badge variant={lesson.visibility === Visibility.PUBLISHED ? "default" : "secondary"} className="text-xs">
                                {lesson.visibility === Visibility.PUBLISHED ? "Dipublikasikan" : "Draft"}
                              </Badge>
                              <span className="text-xs text-gray-500">Urutan: {lesson.order + 1}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/teacher/courses/${courseId}/lessons/${lesson.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          {lesson.visibility === Visibility.DRAFT && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePublishLesson(lesson.id)}
                            >
                              Publikasikan
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            
            {lessons.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada pelajaran</h3>
                  <p className="text-gray-600 mb-4">
                    Mulai tambahkan pelajaran untuk kursus ini
                  </p>
                  <Link href={`/teacher/courses/${courseId}/lessons/new`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Pelajaran Pertama
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Kuis</h2>
            <Link href={`/teacher/courses/${courseId}/quizzes/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kuis
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={quiz.isExam ? "destructive" : "outline"} className="text-xs">
                          {quiz.isExam ? "Ujian" : "Kuis"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {quiz._count.questions} soal
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {quiz.totalPoints} poin
                        </Badge>
                        {quiz.timeLimit && (
                          <Badge variant="outline" className="text-xs">
                            {quiz.timeLimit / 60} menit
                          </Badge>
                        )}
                        <Badge variant={quiz.visibility === Visibility.PUBLISHED ? "default" : "secondary"} className="text-xs">
                          {quiz.visibility === Visibility.PUBLISHED ? "Dipublikasikan" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/teacher/courses/${courseId}/quizzes/${quiz.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {quizzes.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada kuis</h3>
                  <p className="text-gray-600 mb-4">
                    Buat kuis untuk menguji pemahaman siswa
                  </p>
                  <Link href={`/teacher/courses/${courseId}/quizzes/new`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kuis Pertama
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Tugas</h2>
            <Link href={`/teacher/courses/${courseId}/assignments/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tugas
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{assignment.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {assignment.totalPoints} poin
                        </Badge>
                        {assignment.dueAt && (
                          <Badge variant="outline" className="text-xs">
                            Deadline: {new Date(assignment.dueAt).toLocaleDateString("id-ID")}
                          </Badge>
                        )}
                        <Badge variant={assignment.visibility === Visibility.PUBLISHED ? "default" : "secondary"} className="text-xs">
                          {assignment.visibility === Visibility.PUBLISHED ? "Dipublikasikan" : "Draft"}
                        </Badge>
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/teacher/courses/${courseId}/assignments/${assignment.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {assignments.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada tugas</h3>
                  <p className="text-gray-600 mb-4">
                    Buat tugas untuk siswa
                  </p>
                  <Link href={`/teacher/courses/${courseId}/assignments/new`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Tugas Pertama
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kursus</CardTitle>
              <CardDescription>
                Kelola pengaturan dan konfigurasi kursus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Status Publikasi</h4>
                    <p className="text-sm text-gray-600">
                      Kursus ini {course.visibility === Visibility.PUBLISHED ? "telah dipublikasikan" : "masih draft"}
                    </p>
                  </div>
                  <Link href={`/teacher/courses/${courseId}/edit`}>
                    <Button variant="outline">
                      Edit Pengaturan
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Enrollment Siswa</h4>
                    <p className="text-sm text-gray-600">
                      {course._count.enrollments} siswa terdaftar
                    </p>
                  </div>
                  <Link href={`/teacher/courses/${courseId}/students`}>
                    <Button variant="outline">
                      Kelola Siswa
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Statistik Kursus</h4>
                    <p className="text-sm text-gray-600">
                      Lihat statistik dan analitik kursus
                    </p>
                  </div>
                  <Link href={`/teacher/courses/${courseId}/analytics`}>
                    <Button variant="outline">
                      Lihat Statistik
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}