"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  School,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { data: session } = useSession()

  if (!session) {
    return <div>Loading...</div>
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">
              Anda tidak memiliki izin untuk mengakses halaman ini
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Kembali ke Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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