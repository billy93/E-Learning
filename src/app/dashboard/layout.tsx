"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Settings, 
  Bell, 
  MessageSquare,
  TrendingUp,
  Calendar,
  LogOut,
  Menu,
  X,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = {
  STUDENT: [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Kursus Saya", href: "/courses", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Kalender", href: "/calendar", icon: Calendar },
    { name: "Pesan", href: "/messages", icon: MessageSquare },
    { name: "Notifikasi", href: "/notifications", icon: Bell },
  ],
  TEACHER: [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Kursus Saya", href: "/teacher/courses", icon: BookOpen },
    { name: "Siswa", href: "/teacher/students", icon: Users },
    { name: "Kalender", href: "/calendar", icon: Calendar },
    { name: "Pesan", href: "/messages", icon: MessageSquare },
    { name: "Notifikasi", href: "/notifications", icon: Bell },
  ],
  PARENT: [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Anak Saya", href: "/dashboard/children", icon: Users },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Pesan", href: "/messages", icon: MessageSquare },
    { name: "Notifikasi", href: "/notifications", icon: Bell },
  ],
  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Kursus", href: "/admin/courses", icon: BookOpen },
    { name: "Sekolah", href: "/admin/schools", icon: GraduationCap },
    { name: "Analitik", href: "/admin/analytics", icon: Settings },
    { name: "Pesan", href: "/messages", icon: MessageSquare },
  ]
}

const roleLabels = {
  STUDENT: "Siswa",
  TEACHER: "Guru",
  PARENT: "Orang Tua",
  ADMIN: "Administrator"
}

const roleColors = {
  STUDENT: "bg-blue-100 text-blue-800",
  TEACHER: "bg-green-100 text-green-800",
  PARENT: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800"
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Anda belum login</h1>
          <Link href="/auth/signin">
            <Button>Masuk</Button>
          </Link>
        </div>
      </div>
    )
  }

  const userNavigation = navigation[session.user.role as keyof typeof navigation] || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {userNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r">
        <div className="flex items-center justify-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">E-Learning</h1>
              <p className="text-xs text-gray-500">Platform Digital</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {userNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback>
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <Badge className={`text-xs ${roleColors[session.user.role as keyof typeof roleColors]}`}>
                {roleLabels[session.user.role as keyof typeof roleLabels]}
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Selamat datang, {session.user.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}