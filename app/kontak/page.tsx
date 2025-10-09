"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Calendar, Users, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengirim pesan");
      }

      toast({
        title: "Pesan Terkirim",
        description: "Terima kasih! Kami akan segera menghubungi Anda.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      setSubmitError(errorMessage);
      toast({
        title: "Gagal Mengirim",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
                <CardTitle className="flex items-center gap-2 py-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Kritik & Saran 
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
                      placeholder="Subjek pesan Anda (Contoh: Fasilitas)"
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

                  {submitError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {submitError}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader className="pt-2">
                <CardTitle>Informasi Kontak</CardTitle>
                <CardDescription>Cara lain untuk menghubungi kami</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">
                      Jl. H. Awaludin IV, RT.3/RW.17
                      <br />
                      Kebon Melati, Tanah Abang
                      <br />
                      Jakarta Pusat 10230
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
                    <p className="text-sm text-muted-foreground">info@rptrakebonmelati.id</p>
                    <p className="text-sm text-muted-foreground">admin@rptrakebonmelati.id</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="py-2">
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
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#map-section">
                    <MapPin className="w-4 h-4 mr-2" />
                    Lihat Peta Lokasi
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="py-2">
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
        <div id="map-section" className="mt-12">
          <Card className="py-2">
            <CardHeader>
              <CardTitle>Lokasi Kami</CardTitle>
              <CardDescription>Temukan RPTRA Kebon Melati di peta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.479640730367!2d106.8142379!3d-6.2002777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f6a1a8e9fd37%3A0xfd41c3867e738112!2sRPTRA%20Kebon%20Melati!5e0!3m2!1sid!2sid!4v1755798002460!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}