"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  ArrowLeft,
  Activity,
  Target,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "../../layout"

interface ChildDetail {
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
    enrolledAt: string
    course: {
      id: string
      title: string
      description: string
      category: string
    }
  }[]
  activities: {
    id: string
    type: string
    description: string
    createdAt: string
    course?: {
      title: string
    }
  }[]
  stats: {
    totalCourses: number
    completedCourses: number
    averageProgress: number
    totalTimeSpent: number
  }
}

export default function ChildDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const childId = params.childId as string
  const [child, setChild] = useState<ChildDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === 'PARENT' && childId) {
      fetchChildDetail()
    }
  }, [session, childId])

  const fetchChildDetail = async () => {
    try {
      const [childResponse, statsResponse, activityResponse] = await Promise.all([
        fetch(`/api/parent/children/${childId}`),
        fetch(`/api/parent/children/${childId}/stats`),
        fetch(`/api/parent/children/${childId}/activity`)
      ])

      if (childResponse.ok && statsResponse.ok && activityResponse.ok) {
        const [childData, statsData, activityData] = await Promise.all([
          childResponse.json(),
          statsResponse.json(),
          activityData.json()
        ])

        setChild({
          ...childData,
          stats: statsData,
          activities: activityData
        })
      }
    } catch (error) {
      console.error('Error fetching child detail:', error)
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
            <p className="text-gray-600">Memuat detail anak...</p>
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

  if (!child) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Anak Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Data anak yang Anda cari tidak ditemukan.</p>
          <Button asChild>
            <Link href="/dashboard/children">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Anak
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/children">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/avatars/${child.id}.jpg`} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {child.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {child.school?.name && (
                  <Badge variant="outline">
                    {child.school.name}
                  </Badge>
                )}
                {child.grade && (
                  <Badge variant="secondary">
                    Kelas {child.grade}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kursus Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.stats.completedCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{child.stats.averageProgress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waktu Belajar</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(child.stats.totalTimeSpent / 60)}h</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Kursus</TabsTrigger>
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-4">
              {child.enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                        <CardDescription>{enrollment.course.description}</CardDescription>
                        <Badge variant="outline" className="w-fit">
                          {enrollment.course.category}
                        </Badge>
                      </div>
                      <Badge variant={enrollment.progress === 100 ? "default" : "secondary"}>
                        {enrollment.progress === 100 ? "Selesai" : "Berlangsung"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Dimulai: {new Date(enrollment.enrolledAt).toLocaleDateString('id-ID')}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${enrollment.course.id}`}>
                            Lihat Kursus
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              {child.activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.course && (
                          <p className="text-xs text-gray-500">Kursus: {activity.course.title}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}