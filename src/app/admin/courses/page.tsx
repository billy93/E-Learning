"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardLayout from "../../dashboard/layout"
import { 
  BookOpen, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Archive
} from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  subject: string
  gradeLevel: string
  teacherName: string
  schoolName?: string
  enrollmentCount: number
  visibility: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  averageProgress: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL")
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVisibility = visibilityFilter === "ALL" || course.visibility === visibilityFilter
    const matchesSubject = subjectFilter === "ALL" || course.subject === subjectFilter
    return matchesSearch && matchesVisibility && matchesSubject
  })

  const getVisibilityBadgeColor = (visibility: string) => {
    switch (visibility) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'PUBLISHED': return 'Dipublikasi'
      case 'DRAFT': return 'Draft'
      case 'ARCHIVED': return 'Diarsipkan'
      default: return visibility
    }
  }

  const getSubjects = () => {
    const subjects = [...new Set(courses.map(c => c.subject))]
    return subjects.sort()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end">
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kursus
            </Button>
          </Link>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kursus</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dipublikasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.visibility === 'PUBLISHED').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.averageProgress, 0) / courses.length) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari judul, deskripsi, atau guru..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="ALL">Semua Status</option>
                <option value="PUBLISHED">Dipublikasi</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Diarsipkan</option>
              </select>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="ALL">Semua Mata Pelajaran</option>
                {getSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge className={getVisibilityBadgeColor(course.visibility)}>
                  {getVisibilityLabel(course.visibility)}
                </Badge>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mata Pelajaran:</span>
                  <span className="font-medium">{course.subject}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kelas:</span>
                  <span className="font-medium">{course.gradeLevel}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Guru:</span>
                  <span className="font-medium">{course.teacherName}</span>
                </div>
                {course.schoolName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sekolah:</span>
                    <span className="font-medium">{course.schoolName}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{course.enrollmentCount}</div>
                    <div className="text-xs text-gray-600">Siswa</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{course.averageProgress}%</div>
                    <div className="text-xs text-gray-600">Progress Rata-rata</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <div className="text-xs text-gray-500">
                    Dibuat {new Date(course.createdAt).toLocaleDateString('id-ID')}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {course.visibility === 'PUBLISHED' ? (
                      <Button size="sm" variant="outline">
                        <Archive className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada kursus yang ditemukan</p>
          </CardContent>
      </Card>
    )}
      </div>
    </DashboardLayout>
  )
}