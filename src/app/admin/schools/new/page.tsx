"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "../../../dashboard/layout"
import { ArrowLeft, Save, School, MapPin, Phone, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreateSchoolForm {
  name: string
  address: string
  phone: string
  email: string
  type: 'SD' | 'SMP' | 'SMA' | 'SMK' | 'UNIVERSITAS'
  description?: string
  website?: string
}

export default function NewSchoolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateSchoolForm>({
    name: '',
    address: '',
    phone: '',
    email: '',
    type: 'SD',
    description: '',
    website: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Sekolah berhasil dibuat",
        })
        router.push('/admin/schools')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal membuat sekolah",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat sekolah",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateSchoolForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Informasi Sekolah
            </CardTitle>
            <CardDescription>
              Masukkan informasi lengkap untuk sekolah baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Sekolah</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama sekolah"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Alamat
                </Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap sekolah"
                  value={form.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Masukkan nomor telepon"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email sekolah"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Sekolah</Label>
                  <Select value={form.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis sekolah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">Sekolah Dasar (SD)</SelectItem>
                      <SelectItem value="SMP">Sekolah Menengah Pertama (SMP)</SelectItem>
                      <SelectItem value="SMA">Sekolah Menengah Atas (SMA)</SelectItem>
                      <SelectItem value="SMK">Sekolah Menengah Kejuruan (SMK)</SelectItem>
                      <SelectItem value="UNIVERSITAS">Universitas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Opsional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.sekolah.com"
                    value={form.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Masukkan deskripsi singkat tentang sekolah"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Menyimpan...' : 'Simpan Sekolah'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}