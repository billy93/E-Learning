"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardLayout from "../../dashboard/layout"
import { 
  School, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Link from "next/link"

interface School {
  id: string
  name: string
  address: string
  phone: string
  email: string
  type: 'SD' | 'SMP' | 'SMA' | 'SMK'
  studentCount: number
  teacherCount: number
  courseCount: number
  isActive: boolean
  createdAt: string
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/admin/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "ALL" || school.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'SD': return 'bg-blue-100 text-blue-800'
      case 'SMP': return 'bg-green-100 text-green-800'
      case 'SMA': return 'bg-purple-100 text-purple-800'
      case 'SMK': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SD': return 'SD'
      case 'SMP': return 'SMP'
      case 'SMA': return 'SMA'
      case 'SMK': return 'SMK'
      default: return type
    }
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
          <Link href="/admin/schools/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Sekolah
            </Button>
          </Link>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sekolah</p>
                <p className="text-2xl font-bold">{schools.length}</p>
              </div>
              <School className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-green-600">
                  {schools.reduce((sum, s) => sum + s.studentCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Guru</p>
                <p className="text-2xl font-bold text-purple-600">
                  {schools.reduce((sum, s) => sum + s.teacherCount, 0)}
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
                <p className="text-sm text-gray-600">Total Kursus</p>
                <p className="text-2xl font-bold text-orange-600">
                  {schools.reduce((sum, s) => sum + s.courseCount, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600" />
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
                placeholder="Cari nama atau alamat sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("ALL")}
              >
                Semua
              </Button>
              <Button
                variant={typeFilter === "SD" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("SD")}
              >
                SD
              </Button>
              <Button
                variant={typeFilter === "SMP" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("SMP")}
              >
                SMP
              </Button>
              <Button
                variant={typeFilter === "SMA" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("SMA")}
              >
                SMA
              </Button>
              <Button
                variant={typeFilter === "SMK" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("SMK")}
              >
                SMK
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{school.name}</CardTitle>
                <Badge className={getTypeBadgeColor(school.type)}>
                  {getTypeLabel(school.type)}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {school.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {school.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {school.email}
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{school.studentCount}</div>
                    <div className="text-xs text-gray-600">Siswa</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{school.teacherCount}</div>
                    <div className="text-xs text-gray-600">Guru</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{school.courseCount}</div>
                    <div className="text-xs text-gray-600">Kursus</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <Badge variant={school.isActive ? "default" : "secondary"}>
                    {school.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada sekolah yang ditemukan</p>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}