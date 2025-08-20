"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  MessageSquare,
  Bell,
  School,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session) {
    return <div>Loading...</div>
  }

  const role = session.user.role

  // Parent Dashboard Content
  if (role === 'PARENT') {
    return renderParentDashboard()
  }

  // Admin Dashboard Content
  if (role === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-gray-600">Kelola seluruh sistem e-learning</p>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Pengaturan
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> dari bulan lalu
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5</span> kursus baru
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sekolah Aktif</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> sekolah baru
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Tindakan admin yang sering dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Kelola Pengguna
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button className="w-full" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Kelola Kursus
                </Button>
              </Link>
              <Link href="/admin/schools">
                <Button className="w-full" variant="outline">
                  <School className="w-4 h-4 mr-2" />
                  Kelola Sekolah
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Lihat Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    action: "Pengguna baru terdaftar", 
                    user: "Ahmad Rizki", 
                    role: "Siswa",
                    time: "5 menit yang lalu" 
                  },
                  { 
                    action: "Kursus baru dibuat", 
                    user: "Budi Santoso", 
                    role: "Guru",
                    time: "1 jam yang lalu" 
                  },
                  { 
                    action: "Sekolah baru ditambahkan", 
                    user: "Admin System", 
                    role: "Admin",
                    time: "2 jam yang lalu" 
                  },
                  { 
                    action: "Pengguna dihapus", 
                    user: "Admin System", 
                    role: "Admin",
                    time: "3 jam yang lalu" 
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-600">
                        {activity.user} • {activity.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Sistem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">Database</p>
                      <p className="text-xs text-gray-600">Normal</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">Server</p>
                      <p className="text-xs text-gray-600">Response time: 45ms</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Normal
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">Storage</p>
                      <p className="text-xs text-gray-600">85% digunakan</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">
                    Warning
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">Backup</p>
                      <p className="text-xs text-gray-600">Terakhir: 2 jam lalu</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    OK
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pengguna</CardTitle>
            <CardDescription>Perbandingan jumlah pengguna berdasarkan peran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">856</div>
                <div className="text-sm text-gray-600">Siswa</div>
                <div className="text-xs text-gray-500">69.4%</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">312</div>
                <div className="text-sm text-gray-600">Guru</div>
                <div className="text-xs text-gray-500">25.3%</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">54</div>
                <div className="text-sm text-gray-600">Orang Tua</div>
                <div className="text-xs text-gray-500">4.4%</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-red-600">12</div>
                <div className="text-sm text-gray-600">Admin</div>
                <div className="text-xs text-gray-500">1.0%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kursus Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 sedang berlangsung</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 deadline minggu ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.5</div>
            <p className="text-xs text-muted-foreground">+2.5 dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Kursus Saya</CardTitle>
          <CardDescription>Kursus yang Anda ikuti saat ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Matematika Kelas 7", progress: 75, teacher: "Budi Santoso", due: "2 hari lagi" },
              { name: "Bahasa Indonesia Kelas 7", progress: 60, teacher: "Siti Aminah", due: "5 hari lagi" },
              { name: "IPA Kelas 7", progress: 45, teacher: "Ahmad Dahlan", due: "1 minggu lagi" }
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{course.name}</h3>
                  <p className="text-sm text-gray-600">Guru: {course.teacher}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <Badge variant="outline">{course.due}</Badge>
                  <Button variant="outline" size="sm" className="mt-2">
                    Lanjutkan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Mengerjakan kuis Matematika", time: "2 jam yang lalu" },
                { action: "Mengumpulkan tugas Bahasa Indonesia", time: "1 hari yang lalu" },
                { action: "Menyelesaikan materi IPA", time: "2 hari yang lalu" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p>{activity.action}</p>
                    <p className="text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Ujian Tengah Semester", content: "UTS akan dimulai tanggal 15 November", time: "1 hari yang lalu" },
                { title: "Libur Semester", content: "Libur semester dimulai 20 Desember", time: "3 hari yang lalu" }
              ].map((announcement, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{announcement.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{announcement.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">12 aktif hari ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Perlu Diperiksa</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">5 overdue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Tindakan umum yang sering Anda lakukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/teacher/courses/new">
              <Button className="w-full" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Buat Kursus Baru
              </Button>
            </Link>
            <Link href="/teacher/assignments">
              <Button className="w-full" variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Periksa Tugas
              </Button>
            </Link>
            <Link href="/teacher/announcements">
              <Button className="w-full" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Buat Pengumuman
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kursus Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Matematika Kelas 7", students: 28, progress: 75 },
                { name: "Bahasa Indonesia Kelas 7", students: 26, progress: 60 },
                { name: "IPA Kelas 7", students: 24, progress: 45 }
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.students} siswa</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{course.progress}%</div>
                    <Progress value={course.progress} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tugas Perlu Diperiksa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { assignment: "Tugas Matematika Bab 3", student: "Ahmad Rizki", time: "2 jam yang lalu" },
                { assignment: "Essay Bahasa Indonesia", student: "Siti Nurhaliza", time: "5 jam yang lalu" },
                { assignment: "Laporan IPA", student: "Budi Cahyono", time: "1 hari yang lalu" }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{task.assignment}</h4>
                    <p className="text-xs text-gray-600">{task.student}</p>
                    <p className="text-xs text-gray-500">{task.time}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Periksa
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderParentDashboard = () => (
    <div className="space-y-6">
      {/* Children Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anak Terdaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Semua aktif</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.3</div>
            <p className="text-xs text-muted-foreground">+1.8 dari bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 deadline minggu ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Ahmad Rizki", grade: "Kelas 7 SMP", avgGrade: 85, courses: 3, pending: 4 },
          { name: "Siti Nurhaliza", grade: "Kelas 5 SD", avgGrade: 90, courses: 4, pending: 4 }
        ].map((child, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{child.name}</CardTitle>
              <CardDescription>{child.grade}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{child.avgGrade}</div>
                  <div className="text-xs text-gray-600">Nilai Rata-rata</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{child.courses}</div>
                  <div className="text-xs text-gray-600">Kursus Aktif</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tugas Pending</span>
                  <Badge variant="outline">{child.pending}</Badge>
                </div>
                <div className="space-y-1">
                  {[
                    { course: "Matematika", progress: 75 },
                    { course: "Bahasa Indonesia", progress: 60 }
                  ].map((course, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>{course.course}</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { child: "Ahmad Rizki", action: "Mengerjakan kuis Matematika", score: 85, time: "2 jam yang lalu" },
              { child: "Siti Nurhaliza", action: "Mengumpulkan tugas Bahasa Indonesia", status: "Diperiksa", time: "5 jam yang lalu" },
              { child: "Ahmad Rizki", action: "Menyelesaikan materi IPA", progress: "100%", time: "1 hari yang lalu" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{activity.child}</h4>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className="text-right">
                  {activity.score && (
                    <Badge className="text-xs">Nilai: {activity.score}</Badge>
                  )}
                  {activity.status && (
                    <Badge variant="outline" className="text-xs">{activity.status}</Badge>
                  )}
                  {activity.progress && (
                    <Badge variant="secondary" className="text-xs">{activity.progress}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 bulan ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">5 perlu approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">2 pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { role: "Siswa", count: 856, percentage: 68.6, color: "bg-blue-500" },
                { role: "Guru", count: 234, percentage: 18.8, color: "bg-green-500" },
                { role: "Orang Tua", count: 134, percentage: 10.7, color: "bg-purple-500" },
                { role: "Administrator", count: 23, percentage: 1.9, color: "bg-red-500" }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.role}</span>
                    <span>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New user registration", user: "John Doe", time: "5 minutes ago" },
                { action: "Course created", user: "Teacher Smith", time: "1 hour ago" },
                { action: "School approved", user: "Admin", time: "2 hours ago" },
                { action: "Assignment submitted", user: "Student A", time: "3 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p>{activity.action}</p>
                    <p className="text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button className="w-full" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Review Courses
              </Button>
            </Link>
            <Link href="/admin/schools">
              <Button className="w-full" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Manage Schools
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="w-full" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session.user.name}
        </p>
      </div>

      {role === "STUDENT" && renderStudentDashboard()}
      {role === "TEACHER" && renderTeacherDashboard()}
      {role === "PARENT" && renderParentDashboard()}
      {role === "ADMIN" && renderAdminDashboard()}
    </div>
  )
}