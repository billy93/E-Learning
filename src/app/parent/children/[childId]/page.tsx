'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  User,
  GraduationCap,
  Calendar,
  FileText,
  HelpCircle,
  CheckCircle,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface Child {
  id: string
  name: string
  email: string
  gradeLevel?: string
}

interface CourseProgress {
  id: string
  title: string
  subject: string
  gradeLevel: string
  teacher: string
  enrolledAt: string
  progress: number
  completedLessons: number
  totalLessons: number
  completedQuizzes: number
  totalQuizzes: number
  completedAssignments: number
  totalAssignments: number
  averageScore: number
}

interface RecentActivity {
  id: string
  type: 'lesson' | 'quiz' | 'assignment'
  title: string
  course: string
  completedAt: string
  score?: number
  status?: 'completed' | 'in_progress' | 'overdue'
}

interface OverallStats {
  totalCourses: number
  completedCourses: number
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  completedQuizzes: number
  totalAssignments: number
  completedAssignments: number
  averageScore: number
  attendanceRate: number
}

export default function ChildDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const childId = params.childId as string
  
  const [loading, setLoading] = useState(true)
  const [child, setChild] = useState<Child | null>(null)
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session.user.role !== 'PARENT') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [status, session, router, childId])

  const fetchData = async () => {
    try {
      const [childRes, coursesRes, activityRes, statsRes] = await Promise.all([
        fetch(`/api/parent/children/${childId}`),
        fetch(`/api/parent/children/${childId}/courses`),
        fetch(`/api/parent/children/${childId}/activity`),
        fetch(`/api/parent/children/${childId}/stats`)
      ])

      if (childRes.ok) {
        const childData = await childRes.json()
        setChild(childData)
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourseProgress(coursesData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setOverallStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeLevelLabel = (gradeLevel?: string) => {
    const labels: Record<string, string> = {
      'SD1': 'SD Kelas 1',
      'SD2': 'SD Kelas 2',
      'SD3': 'SD Kelas 3',
      'SD4': 'SD Kelas 4',
      'SD5': 'SD Kelas 5',
      'SD6': 'SD Kelas 6',
      'SMP7': 'SMP Kelas 7',
      'SMP8': 'SMP Kelas 8',
      'SMP9': 'SMP Kelas 9',
      'SMA10': 'SMA Kelas 10',
      'SMA11': 'SMA Kelas 11',
      'SMA12': 'SMA Kelas 12'
    }
    return labels[gradeLevel || ''] || gradeLevel || '-'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen
      case 'quiz': return HelpCircle
      case 'assignment': return FileText
      default: return Star
    }
  }

  const getActivityBadge = (activity: RecentActivity) => {
    if (activity.score !== undefined) {
      return (
        <Badge variant="secondary" className="ml-2">
          {activity.score} poin
        </Badge>
      )
    }
    
    if (activity.status === 'overdue') {
      return (
        <Badge variant="destructive" className="ml-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Terlambat
        </Badge>
      )
    }
    
    if (activity.status === 'in_progress') {
      return (
        <Badge variant="outline" className="ml-2">
          <Clock className="w-3 h-3 mr-1" />
          Berlangsung
        </Badge>
      )
    }
    
    return (
      <Badge variant="default" className="ml-2">
        <CheckCircle className="w-3 h-3 mr-1" />
        Selesai
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Anak tidak ditemukan</h3>
            <Link href="/parent">
              <Button>Kembali ke Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/parent" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>
      </div>

      {/* Child Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{child.name}</CardTitle>
              <CardDescription>{child.email}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {getGradeLevelLabel(child.gradeLevel)}
                </Badge>
              </div>
            </div>
            {overallStats && (
              <div className="text-right">
                <div className="text-3xl font-bold">{overallStats.averageScore}%</div>
                <div className="text-sm text-gray-600">Rata-rata Nilai</div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kursus Aktif</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalCourses - overallStats.completedCourses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelajaran Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.completedLessons}</div>
              <p className="text-xs text-muted-foreground">
                dari {overallStats.totalLessons} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kuis Selesai</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.completedQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                dari {overallStats.totalQuizzes} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kehadiran</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.attendanceRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Progress */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Progress Kursus</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas Terkini</TabsTrigger>
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Kursus</CardTitle>
              <CardDescription>
                Detail progress pembelajaran untuk setiap kursus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseProgress.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada kursus yang diikuti</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseProgress.map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <p className="text-sm text-gray-600">{course.subject} • {getGradeLevelLabel(course.gradeLevel)}</p>
                            <p className="text-sm text-gray-600">Pengajar: {course.teacher}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{course.progress}%</div>
                            <div className="text-sm text-gray-600">Progress</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pelajaran</span>
                            <span>{course.completedLessons}/{course.totalLessons}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kuis</span>
                            <span>{course.completedQuizzes}/{course.totalQuizzes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tugas</span>
                            <span>{course.completedAssignments}/{course.totalAssignments}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rata-rata Nilai</span>
                            <Badge variant={course.averageScore >= 80 ? 'default' : course.averageScore >= 60 ? 'secondary' : 'destructive'}>
                              {course.averageScore}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terkini</CardTitle>
              <CardDescription>
                Aktivitas pembelajaran terbaru dari anak Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada aktivitas terkini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type)
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.course}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.completedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        {getActivityBadge(activity)}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          {overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistik Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress Pelajaran</span>
                        <span>{Math.round((overallStats.completedLessons / overallStats.totalLessons) * 100)}%</span>
                      </div>
                      <Progress value={(overallStats.completedLessons / overallStats.totalLessons) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress Kuis</span>
                        <span>{Math.round((overallStats.completedQuizzes / overallStats.totalQuizzes) * 100)}%</span>
                      </div>
                      <Progress value={(overallStats.completedQuizzes / overallStats.totalQuizzes) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress Tugas</span>
                        <span>{Math.round((overallStats.completedAssignments / overallStats.totalAssignments) * 100)}%</span>
                      </div>
                      <Progress value={(overallStats.completedAssignments / overallStats.totalAssignments) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pencapaian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kursus Selesai</span>
                      <Badge variant="default">{overallStats.completedCourses}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pelajaran Selesai</span>
                      <Badge variant="default">{overallStats.completedLessons}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kuis Selesai</span>
                      <Badge variant="default">{overallStats.completedQuizzes}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tugas Selesai</span>
                      <Badge variant="default">{overallStats.completedAssignments}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rata-rata Nilai</span>
                      <Badge variant={overallStats.averageScore >= 80 ? 'default' : 'secondary'}>
                        {overallStats.averageScore}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}