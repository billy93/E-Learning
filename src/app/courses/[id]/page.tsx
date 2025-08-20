"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "../../dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  GraduationCap,
  Calendar,
  MessageSquare,
  Play,
  FileText,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { GradeLevel, Visibility } from "@prisma/client"

interface Course {
  id: string
  title: string
  description?: string
  subject: string
  gradeLevel: GradeLevel
  teacher: {
    name: string
    email: string
  }
  visibility: Visibility
  createdAt: string
  _count: {
    enrollments: number
    lessons: number
    quizzes: number
    assignments: number
  }
  enrolled?: boolean
  enrollment?: {
    status: string
    createdAt: string
  }
  lessons: Array<{
    id: string
    title: string
    order: number
    contentType: string
    visibility: Visibility
  }>
  announcements: Array<{
    id: string
    title: string
    body: string
    createdAt: string
  }>
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

export default function CourseDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!session) return

    setEnrolling(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })

      if (response.ok) {
        fetchCourse() // Refresh course data
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Kursus tidak ditemukan</h3>
          <p className="text-gray-600 mb-4">
            Kursus yang Anda cari tidak tersedia atau telah dihapus
          </p>
          <Button onClick={() => router.push("/courses")}>
            Kembali ke Daftar Kursus
          </Button>
        </CardContent>
      </Card>
    )
  }

  const canViewContent = course.enrolled && session?.user.role === "STUDENT"
  const isTeacher = session?.user.id === course.teacher.id || session?.user.role === "ADMIN"

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {gradeLevelLabels[course.gradeLevel]}
                </Badge>
                <Badge variant="outline">{course.subject}</Badge>
                {course.visibility === Visibility.DRAFT && (
                  <Badge variant="destructive">Draft</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="text-base">
                {course.description || "Tidak ada deskripsi"}
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span>{course.teacher.name}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{course._count.enrollments} siswa</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(course.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {session?.user.role === "STUDENT" && !course.enrolled && (
                <Button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  size="lg"
                >
                  {enrolling ? "Mendaftar..." : "Daftar Kursus"}
                </Button>
              )}
              
              {course.enrolled && (
                <Button variant="outline" size="lg">
                  Lanjutkan Belajar
                </Button>
              )}
              
              {isTeacher && (
                <Link href={`/teacher/courses/${course.id}/edit`}>
                  <Button variant="outline" size="lg">
                    Edit Kursus
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Total Kuis</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.quizzes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course._count.assignments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">(124 ulasan)</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Pelajaran</TabsTrigger>
          <TabsTrigger value="assignments">Tugas</TabsTrigger>
          <TabsTrigger value="quizzes">Kuis</TabsTrigger>
          <TabsTrigger value="announcements">Pengumuman</TabsTrigger>
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pelajaran</CardTitle>
              <CardDescription>
                Urutan pelajaran dalam kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.lessons
                  .filter(lesson => lesson.visibility === Visibility.PUBLISHED || isTeacher)
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600 capitalize">{lesson.contentType.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.visibility === Visibility.DRAFT && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {canViewContent ? (
                          <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Mulai
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <Play className="w-4 h-4 mr-2" />
                            Terkunci
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                
                {course.lessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada pelajaran dalam kursus ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tugas</CardTitle>
              <CardDescription>
                Daftar tugas untuk kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canViewContent ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {course._count.assignments} tugas tersedia
                    </p>
                    <Link href={`/courses/${courseId}/assignments`}>
                      <Button>Lihat Semua Tugas</Button>
                    </Link>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Klik "Lihat Semua Tugas" untuk melihat dan mengumpulkan tugas</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Anda harus mendaftar kursus terlebih dahulu untuk mengakses tugas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kuis</CardTitle>
              <CardDescription>
                Daftar kuis untuk kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canViewContent ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {course._count.quizzes} kuis tersedia
                    </p>
                    <Link href={`/courses/${courseId}/quizzes`}>
                      <Button>Lihat Semua Kuis</Button>
                    </Link>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Klik "Lihat Semua Kuis" untuk melihat dan mengerjakan kuis</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Anda harus mendaftar kursus terlebih dahulu untuk mengakses kuis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengumuman</CardTitle>
              <CardDescription>
                Pengumuman terkait kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{announcement.body}</p>
                  </div>
                ))}
                
                {course.announcements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada pengumuman untuk kursus ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tentang Kursus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Deskripsi</h4>
                    <p className="text-sm text-gray-600">
                      {course.description || "Tidak ada deskripsi tersedia untuk kursus ini."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Informasi Kursus</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mata Pelajaran</span>
                        <span>{course.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tingkat</span>
                        <span>{gradeLevelLabels[course.gradeLevel]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pengajar</span>
                        <span>{course.teacher.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durasi</span>
                        <span>8 minggu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Pembelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                {course.enrolled ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress Keseluruhan</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pelajaran Selesai</span>
                        <span>5 / 12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kuis Selesai</span>
                        <span>2 / 4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tugas Selesai</span>
                        <span>3 / 6</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Daftar kursus untuk melihat progress pembelajaran</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}