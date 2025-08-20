"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import DashboardLayout from "../dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Award, 
  BookOpen,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Trophy,
  Star,
  BarChart3
} from "lucide-react"

interface ProgressData {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  studyTime: number
  streak: number
}

interface Badge {
  id: string
  name: string
  description: string
  iconUrl?: string
  isEarned: boolean
  earnedAt?: string
}

interface CourseProgress {
  courseId: string
  courseName: string
  progress: number
  completedLessons: number
  totalLessons: number
  completedQuizzes: number
  totalQuizzes: number
  lastAccessed: string
}

export default function ProgressPage() {
  const { data: session } = useSession()
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchProgressData()
    } else {
      setLoading(false)
    }
  }, [session])

  if (!session) {
    return <div>Loading...</div>
  }

  const fetchProgressData = async () => {
    try {
      const [progressRes, badgesRes, coursesRes] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/badges'),
        fetch('/api/progress/courses')
      ])

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgressData(progressData)
      }

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json()
        setBadges(badgesData)
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourseProgress(coursesData)
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}j ${mins}m`
    }
    return `${mins}m`
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600'
    if (streak >= 14) return 'text-blue-600'
    if (streak >= 7) return 'text-green-600'
    if (streak >= 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!progressData) {
    return <div>Error loading progress data</div>
  }

  const completionRate = progressData.totalCourses > 0 
    ? Math.round((progressData.completedCourses / progressData.totalCourses) * 100)
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Progress & Pencapaian</h1>
          <p className="text-gray-600">Lacak perkembangan belajar Anda</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kursus Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.completedCourses}</div>
              <p className="text-xs text-muted-foreground">
                dari {progressData.totalCourses} kursus
              </p>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waktu Belajar</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(progressData.studyTime)}</div>
              <p className="text-xs text-muted-foreground">total waktu</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                dari {progressData.completedQuizzes} kuis
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStreakColor(progressData.streak)}`}>
                {progressData.streak} hari
              </div>
              <p className="text-xs text-muted-foreground">
                {progressData.streak >= 7 ? 'Luar biasa!' : 'Terus belajar!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Kursus</CardTitle>
            <CardDescription>Perkembangan Anda di setiap kursus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.courseId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{course.courseName}</h3>
                    <Badge variant={course.progress === 100 ? "default" : "outline"}>
                      {course.progress === 100 ? 'Selesai' : `${course.progress}%`}
                    </Badge>
                  </div>
                  
                  <Progress value={course.progress} className="mb-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span>{course.completedLessons}/{course.totalLessons} pelajaran</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>{course.completedQuizzes}/{course.totalQuizzes} kuis</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Terakhir diakses: {new Date(course.lastAccessed).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
              
              {courseProgress.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada progress kursus</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badge & Pencapaian</CardTitle>
            <CardDescription>Badge yang telah Anda dapatkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`text-center p-4 border rounded-lg transition-all ${
                    badge.isEarned
                      ? 'border-yellow-300 bg-yellow-50 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    {badge.isEarned ? (
                      <Star className="w-8 h-8 text-white" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                  {badge.isEarned && badge.earnedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Insight Belajar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Waktu belajar rata-rata</span>
                  <span className="font-medium">45 menit/hari</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hari paling aktif</span>
                  <span className="font-medium">Senin & Rabu</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Waktu favorit</span>
                  <span className="font-medium">19:00 - 21:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mata pelajaran terbaik</span>
                  <span className="font-medium">Matematika</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Target Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Selesaikan 2 kursus</span>
                    <span className="text-sm font-medium">1/2</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Dapatkan nilai 85+</span>
                    <span className="text-sm font-medium">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Belajar 20 jam</span>
                    <span className="text-sm font-medium">12/20 jam</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Maintain streak 7 hari</span>
                    <span className="text-sm font-medium">{progressData.streak}/7</span>
                  </div>
                  <Progress value={(progressData.streak / 7) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}