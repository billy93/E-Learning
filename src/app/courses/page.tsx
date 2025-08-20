"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import DashboardLayout from "../dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  Search,
  Filter,
  GraduationCap
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
  }
  visibility: Visibility
  _count: {
    enrollments: number
    lessons: number
  }
  enrolled?: boolean
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

export default function CoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedGrade) params.append("gradeLevel", selectedGrade)
      if (selectedSubject) params.append("subject", selectedSubject)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/courses?${params}`)
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
  }, [selectedGrade, selectedSubject, searchTerm])

  const handleEnroll = async (courseId: string) => {
    if (!session) return

    setEnrolling(courseId)
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })

      if (response.ok) {
        // Update the course enrollment status
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, enrolled: true }
            : course
        ))
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
    } finally {
      setEnrolling(null)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (course.visibility !== Visibility.PUBLISHED) return false
    if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !course.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedGrade && selectedGrade !== "all" && course.gradeLevel !== selectedGrade) {
      return false
    }
    if (selectedSubject && selectedSubject !== "all" && course.subject !== selectedSubject) {
      return false
    }
    return true
  })

  const gradeLevels = Object.entries(gradeLevelLabels).map(([value, label]) => ({
    value,
    label
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kursus</h1>
          <p className="text-muted-foreground">
            Jelajahi kursus yang tersedia dan daftar untuk mulai belajar
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari kursus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                {gradeLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchCourses}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">
                    {gradeLevelLabels[course.gradeLevel]}
                  </Badge>
                  <Badge variant="outline">{course.subject}</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description || "Tidak ada deskripsi"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      <span>{course.teacher.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course._count.enrollments}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{course._count.lessons} pelajaran</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>8 minggu</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm">4.8 (124)</span>
                    </div>
                    
                    {session?.user.role === "STUDENT" && (
                      course.enrolled ? (
                        <Link href={`/courses/${course.id}`}>
                          <Button size="sm">Lihat Kursus</Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling === course.id}
                        >
                          {enrolling === course.id ? "Mendaftar..." : "Daftar"}
                        </Button>
                      )
                    )}
                    
                    {session?.user.role !== "STUDENT" && (
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" variant="outline">Lihat Detail</Button>
                      </Link>
                    )}
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
            <h3 className="text-lg font-semibold mb-2">Tidak ada kursus ditemukan</h3>
            <p className="text-gray-600 mb-4">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setSelectedGrade("all")
              setSelectedSubject("all")
            }}>
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}