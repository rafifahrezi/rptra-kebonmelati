"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Calendar, Users } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // Reset form or show success message
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Hubungi <span className="text-primary">Kami</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Kami siap membantu Anda! Jangan ragu untuk menghubungi kami jika ada pertanyaan, saran, atau ingin
            berpartisipasi dalam kegiatan RPTRA Kebon Melati.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Kirim Pesan
                </CardTitle>
                <CardDescription>
                  Isi formulir di bawah ini dan kami akan merespons pesan Anda sesegera mungkin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori Pesan</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informasi">Informasi Umum</SelectItem>
                          <SelectItem value="pendaftaran">Pendaftaran Kegiatan</SelectItem>
                          <SelectItem value="saran">Saran & Masukan</SelectItem>
                          <SelectItem value="kerjasama">Kerjasama</SelectItem>
                          <SelectItem value="keluhan">Keluhan</SelectItem>
                          <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek *</Label>
                    <Input
                      id="subject"
                      placeholder="Subjek pesan Anda"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tulis pesan Anda di sini..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>Cara lain untuk menghubungi kami</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">
                      Jl. Kebon Melati No. 123
                      <br />
                      Jakarta Pusat, DKI Jakarta 10230
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Telepon</p>
                    <p className="text-sm text-muted-foreground">(021) 123-4567</p>
                    <p className="text-sm text-muted-foreground">+62 812-3456-7890</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">info@rptrakebon melati.id</p>
                    <p className="text-sm text-muted-foreground">admin@rptrakebon melati.id</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Jam Operasional</p>
                    <p className="text-sm text-muted-foreground">Senin - Jumat: 06:00 - 21:00</p>
                    <p className="text-sm text-muted-foreground">Sabtu - Minggu: 06:00 - 22:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Layanan yang sering dicari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/kegiatan">
                    <Calendar className="w-4 h-4 mr-2" />
                    Lihat Jadwal Kegiatan
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/tentang">
                    <Users className="w-4 h-4 mr-2" />
                    Tentang RPTRA
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Langsung
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Pertanyaan Umum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm">Bagaimana cara mendaftar kegiatan?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anda dapat mendaftar melalui halaman kegiatan atau datang langsung ke RPTRA.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Apakah ada biaya untuk bergabung?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sebagian besar kegiatan gratis, beberapa workshop mungkin ada biaya minimal.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Usia berapa yang bisa ikut kegiatan?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kami melayani semua usia, dari balita hingga dewasa dengan program yang sesuai.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Lokasi Kami</CardTitle>
              <CardDescription>Temukan RPTRA Kebon Melati di peta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Peta akan ditampilkan di sini</p>
                  <p className="text-sm text-muted-foreground">
                    Jl. Kebon Melati No. 123, Jakarta Pusat, DKI Jakarta 10230
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
