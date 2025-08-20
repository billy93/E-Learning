"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Users, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Calendar
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GradeLevel, Visibility } from "@prisma/client"
import DashboardLayout from "../../dashboard/layout"

interface Course {
  id: string
  title: string
  description?: string
  subject: string
  gradeLevel: GradeLevel
  visibility: Visibility
  createdAt: string
  _count: {
    enrollments: number
    lessons: number
    quizzes: number
    assignments: number
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

const visibilityLabels = {
  [Visibility.DRAFT]: "Draft",
  [Visibility.PUBLISHED]: "Dipublikasikan",
  [Visibility.ARCHIVED]: "Diarsipkan"
}

const visibilityColors = {
  [Visibility.DRAFT]: "bg-gray-100 text-gray-800",
  [Visibility.PUBLISHED]: "bg-green-100 text-green-800",
  [Visibility.ARCHIVED]: "bg-red-100 text-red-800"
}

export default function TeacherCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVisibility, setSelectedVisibility] = useState<string>("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedVisibility) params.append("visibility", selectedVisibility)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/teacher/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [selectedVisibility, searchTerm])

  const handlePublish = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: "POST",
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error("Error publishing course:", error)
    }
  }

  const handleArchive = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/archive`, {
        method: "POST",
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error("Error archiving course:", error)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !course.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const visibilityOptions = Object.entries(visibilityLabels).map(([value, label]) => ({
    value,
    label
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kursus Saya</h1>
          <p className="text-muted-foreground">
            Kelola semua kursus yang Anda buat
          </p>
        </div>
        <Link href="/teacher/courses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Kursus Baru
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter(c => c.visibility === Visibility.PUBLISHED).length} dipublikasikan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course._count.enrollments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">terdaftar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.visibility === Visibility.DRAFT).length}
            </div>
            <p className="text-xs text-muted-foreground">perlu ditinjau</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">rata-rata</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari kursus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={selectedVisibility} 
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Semua Status</option>
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={fetchCourses}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={visibilityColors[course.visibility]}>
                        {visibilityLabels[course.visibility]}
                      </Badge>
                      <Badge variant="outline">{course.subject}</Badge>
                      <Badge variant="secondary">
                        {gradeLevelLabels[course.gradeLevel]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>
                      {course.description || "Tidak ada deskripsi"}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/courses/${course.id}`}>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Kursus
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/teacher/courses/${course.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Kursus
                        </DropdownMenuItem>
                      </Link>
                      {course.visibility === Visibility.DRAFT && (
                        <DropdownMenuItem onClick={() => handlePublish(course.id)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Publikasikan
                        </DropdownMenuItem>
                      )}
                      {course.visibility === Visibility.PUBLISHED && (
                        <DropdownMenuItem onClick={() => handleArchive(course.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Arsipkan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {course._count.enrollments}
                    </div>
                    <div className="text-xs text-gray-600">Siswa</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {course._count.lessons}
                    </div>
                    <div className="text-xs text-gray-600">Pelajaran</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {course._count.quizzes}
                    </div>
                    <div className="text-xs text-gray-600">Kuis</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {course._count.assignments}
                    </div>
                    <div className="text-xs text-gray-600">Tugas</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Link href={`/teacher/courses/${course.id}/manage`}>
                      <Button size="sm" variant="outline">
                        Kelola
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Dibuat {new Date(course.createdAt).toLocaleDateString("id-ID")}</span>
                    <div className="flex gap-2">
                      {course.visibility === Visibility.DRAFT && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublish(course.id)}
                        >
                          Publikasikan
                        </Button>
                      )}
                      <Link href={`/teacher/courses/${course.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada kursus</h3>
            <p className="text-gray-600 mb-4">
              Mulai buat kursus pertama Anda untuk membagikan pengetahuan
            </p>
            <Link href="/teacher/courses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Kursus Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}