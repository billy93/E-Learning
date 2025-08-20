'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  GraduationCap,
  Calendar,
  FileText,
  HelpCircle
} from 'lucide-react'

interface Child {
  id: string
  name: string
  email: string
  gradeLevel?: string
  _count: {
    enrollments: number
  }
}

interface ChildProgress {
  childId: string
  childName: string
  totalCourses: number
  completedCourses: number
  averageScore: number
  recentActivity: Array<{
    type: 'lesson' | 'quiz' | 'assignment'
    title: string
    course: string
    completedAt: string
    score?: number
  }>
}

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddChildDialog, setShowAddChildDialog] = useState(false)
  const [childEmail, setChildEmail] = useState('')

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
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [childrenRes, progressRes] = await Promise.all([
        fetch('/api/parent/children'),
        fetch('/api/parent/progress')
      ])

      if (childrenRes.ok) {
        const childrenData = await childrenRes.json()
        setChildren(childrenData)
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setChildrenProgress(progressData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/parent/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: childEmail }),
      })

      if (response.ok) {
        setChildEmail('')
        setShowAddChildDialog(false)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal menambahkan anak')
      }
    } catch (error) {
      console.error('Failed to add child:', error)
      alert('Terjadi kesalahan saat menambahkan anak')
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

  const getActivityBadge = (activity: any) => {
    if (activity.score !== undefined) {
      return (
        <Badge variant="secondary" className="ml-2">
          {activity.score} poin
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="ml-2">
        Selesai
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Orang Tua</h1>
        <p className="text-gray-600">Monitor progress pembelajaran anak-anak Anda</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anak</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childrenProgress.reduce((sum, child) => sum + child.totalCourses, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kursus Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childrenProgress.reduce((sum, child) => sum + child.completedCourses, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {childrenProgress.length > 0 
                ? Math.round(childrenProgress.reduce((sum, child) => sum + child.averageScore, 0) / childrenProgress.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Management */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Anak-Anak Anda</CardTitle>
              <CardDescription>
                Kelola dan monitor progress pembelajaran anak-anak Anda
              </CardDescription>
            </div>
            <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Anak
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Anak</DialogTitle>
                  <DialogDescription>
                    Masukkan email anak yang ingin ditambahkan ke akun Anda
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddChild} className="space-y-4">
                  <div>
                    <Label htmlFor="childEmail">Email Anak</Label>
                    <Input
                      id="childEmail"
                      type="email"
                      value={childEmail}
                      onChange={(e) => setChildEmail(e.target.value)}
                      placeholder="masukkan@email.com"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Tambah</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddChildDialog(false)}>
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada anak terdaftar</h3>
              <p className="text-gray-600 mb-4">
                Tambahkan anak-anak Anda untuk mulai memonitor progress pembelajaran mereka
              </p>
              <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Anak Pertama
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Anak</DialogTitle>
                    <DialogDescription>
                      Masukkan email anak yang ingin ditambahkan ke akun Anda
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddChild} className="space-y-4">
                    <div>
                      <Label htmlFor="childEmail">Email Anak</Label>
                      <Input
                        id="childEmail"
                        type="email"
                        value={childEmail}
                        onChange={(e) => setChildEmail(e.target.value)}
                        placeholder="masukkan@email.com"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Tambah</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddChildDialog(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid gap-4">
              {children.map((child) => {
                const progress = childrenProgress.find(p => p.childId === child.id)
                return (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          <CardDescription>{child.email}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {getGradeLevelLabel(child.gradeLevel)}
                            </Badge>
                            <Badge variant="outline">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {child._count.enrollments} kursus
                            </Badge>
                          </div>
                        </div>
                        {progress && (
                          <div className="text-right">
                            <div className="text-2xl font-bold">{progress.averageScore}%</div>
                            <div className="text-sm text-gray-600">Rata-rata Nilai</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {progress && (
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress Kursus</span>
                              <span>{progress.completedCourses}/{progress.totalCourses}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(progress.completedCourses / progress.totalCourses) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Kursus Aktif</span>
                              <span>{progress.totalCourses - progress.completedCourses}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Kursus Selesai</span>
                              <span>{progress.completedCourses}</span>
                            </div>
                          </div>
                        </div>
                        
                        {progress.recentActivity.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Aktivitas Terkini</h4>
                            <div className="space-y-2">
                              {progress.recentActivity.slice(0, 3).map((activity, index) => {
                                const Icon = getActivityIcon(activity.type)
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4 text-gray-600" />
                                      <div>
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-gray-600">{activity.course}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-xs text-gray-500 mr-2">
                                        {new Date(activity.completedAt).toLocaleDateString('id-ID')}
                                      </span>
                                      {getActivityBadge(activity)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}