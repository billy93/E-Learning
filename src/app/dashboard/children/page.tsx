"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Eye,
  Plus
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "../layout"

interface Child {
  id: string
  name: string
  email: string
  grade?: string
  school?: {
    name: string
  }
  enrollments: {
    id: string
    progress: number
    course: {
      id: string
      title: string
      description: string
    }
  }[]
  _count: {
    enrollments: number
  }
}

export default function ChildrenPage() {
  const { data: session, status } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === 'PARENT') {
      fetchChildren()
    }
  }, [session])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/parent/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data anak...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (session?.user?.role !== 'PARENT') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600">Halaman ini hanya untuk orang tua.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Anak Saya</h1>
            <p className="text-gray-600 mt-2">
              Pantau progress dan aktivitas belajar anak-anak Anda
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/children/add">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Anak
            </Link>
          </Button>
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum Ada Anak Terdaftar</h3>
              <p className="text-gray-600 mb-6">
                Tambahkan anak Anda untuk mulai memantau progress belajar mereka.
              </p>
              <Button asChild>
                <Link href="/dashboard/children/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Anak Pertama
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => {
              const totalProgress = child.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0)
              const averageProgress = child.enrollments.length > 0 ? Math.round(totalProgress / child.enrollments.length) : 0
              
              return (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/avatars/${child.id}.jpg`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {child.school?.name && (
                            <Badge variant="outline" className="text-xs">
                              {child.school.name}
                            </Badge>
                          )}
                          {child.grade && (
                            <Badge variant="secondary" className="text-xs">
                              Kelas {child.grade}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{child._count.enrollments} Kursus</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">{averageProgress}% Progress</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress Keseluruhan</span>
                        <span className="font-medium">{averageProgress}%</span>
                      </div>
                      <Progress value={averageProgress} className="h-2" />
                    </div>

                    {child.enrollments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Kursus Aktif:</h4>
                        <div className="space-y-1">
                          {child.enrollments.slice(0, 2).map((enrollment) => (
                            <div key={enrollment.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600 truncate flex-1 mr-2">
                                {enrollment.course.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {enrollment.progress}%
                              </Badge>
                            </div>
                          ))}
                          {child.enrollments.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{child.enrollments.length - 2} kursus lainnya
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/dashboard/children/${child.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}