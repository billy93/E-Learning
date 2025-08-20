"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Users, Settings } from "lucide-react"
import Link from "next/link"

const roles = [
  {
    id: "student",
    title: "Siswa",
    description: "Pelajari materi, ikuti kuis, dan kumpulkan tugas",
    icon: BookOpen,
    color: "bg-blue-500",
    features: ["Akses kursus interaktif", "Ikuti kuis dan ujian", "Lacak progress belajar", "Dapatkan sertifikat"]
  },
  {
    id: "teacher",
    title: "Guru",
    description: "Buat kursus, materi, dan nilai siswa",
    icon: GraduationCap,
    color: "bg-green-500",
    features: ["Buat dan kelola kursus", "Upload materi pembelajaran", "Buat kuis dan tugas", "Monitoring siswa"]
  },
  {
    id: "parent",
    title: "Orang Tua",
    description: "Monitor progress anak dan komunikasi dengan guru",
    icon: Users,
    color: "bg-purple-500",
    features: ["Monitor progress anak", "Lihat nilai dan tugas", "Komunikasi dengan guru", "Terima notifikasi"]
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Kelola sistem, pengguna, dan analitik",
    icon: Settings,
    color: "bg-red-500",
    features: ["Kelola pengguna", "Moderasi konten", "Analitik sistem", "Konfigurasi platform"]
  }
]

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">E-Learning Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Platform Pembelajaran Digital untuk SD, SMP, dan SMA
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Solusi lengkap untuk pembelajaran jarak jauh dengan fitur interaktif, monitoring real-time, 
            dan komunikasi yang mudah antara siswa, guru, dan orang tua.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🎓 Kurikulum Nasional
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              📱 Mobile Friendly
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              📊 Progress Tracking
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              💬 Real-time Communication
            </Badge>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Pilih Peran Anda
            </h3>
            <p className="text-lg text-gray-600">
              Setiap peran memiliki fitur dan akses yang disesuaikan dengan kebutuhan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRole === role.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {selectedRole && (
            <div className="text-center mt-8">
              <Link href={`/auth/signup?role=${selectedRole}`}>
                <Button size="lg" className="px-8 py-3">
                  Daftar sebagai {roles.find(r => r.id === selectedRole)?.title}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h3>
            <p className="text-lg text-gray-600">
              Platform lengkap untuk mendukung pembelajaran digital
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Kursus Interaktif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Materi pembelajaran yang menarik dengan video, PDF, artikel, dan kuis interaktif 
                  yang disesuaikan dengan kurikulum nasional.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Monitoring Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Guru dan orang tua dapat memantau progress siswa secara real-time, 
                  melihat nilai, dan memberikan feedback langsung.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Sertifikat Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Siswa mendapatkan sertifikat digital setelah menyelesaikan kursus, 
                  yang dapat diunduh dan digunakan sebagai bukti pembelajaran.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">E-Learning Platform</span>
              </div>
              <p className="text-gray-400">
                Platform pembelajaran digital untuk masa depan pendidikan Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Kursus Interaktif</li>
                <li>Quiz & Ujian</li>
                <li>Progress Tracking</li>
                <li>Sertifikat Digital</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Peran</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Siswa</li>
                <li>Guru</li>
                <li>Orang Tua</li>
                <li>Administrator</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 E-Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}