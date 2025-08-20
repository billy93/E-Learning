"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Role, GradeLevel } from "@prisma/client"

const roleLabels = {
  [Role.STUDENT]: "Siswa",
  [Role.TEACHER]: "Guru",
  [Role.PARENT]: "Orang Tua",
  [Role.ADMIN]: "Administrator"
}

const gradeLevelLabels = {
  [GradeLevel.SD1]: "SD Kelas 1",
  [GradeLevel.SD2]: "SD Kelas 2",
  [GradeLevel.SD3]: "SD Kelas 3",
  [GradeLevel.SD4]: "SD Kelas 4",
  [GradeLevel.SD5]: "SD Kelas 5",
  [GradeLevel.SD6]: "SD Kelas 6",
  [GradeLevel.SMP7]: "SMP Kelas 7",
  [GradeLevel.SMP8]: "SMP Kelas 8",
  [GradeLevel.SMP9]: "SMP Kelas 9",
  [GradeLevel.SMA10]: "SMA Kelas 10",
  [GradeLevel.SMA11]: "SMA Kelas 11",
  [GradeLevel.SMA12]: "SMA Kelas 12"
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as Role,
    gradeLevel: "" as GradeLevel
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") as Role

  useEffect(() => {
    if (roleParam && Object.values(Role).includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [roleParam])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError("Semua field wajib diisi")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsLoading(false)
      return
    }

    // For students, grade level is required
    if (formData.role === Role.STUDENT && !formData.gradeLevel) {
      setError("Tingkat kelas wajib diisi untuk siswa")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          gradeLevel: formData.gradeLevel || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat mendaftar")
      } else {
        router.push("/auth/signin?message=Registration successful")
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm" />
            </div>
          </div>
          <CardTitle className="text-2xl">Daftar</CardTitle>
          <CardDescription>
            Buat akun E-Learning Platform Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === Role.STUDENT && (
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Tingkat Kelas</Label>
                <Select value={formData.gradeLevel} onValueChange={(value) => handleChange("gradeLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(gradeLevelLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}