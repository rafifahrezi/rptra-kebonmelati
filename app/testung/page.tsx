import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Target, Eye, Heart, Users, Award, MapPin, Clock, Phone, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Tentang Kami
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                Membangun Masa Depan Anak-anak <span className="text-primary">Jakarta</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                RPTRA Kebon Melati hadir sebagai ruang publik terpadu yang ramah anak, menyediakan fasilitas dan program
                berkualitas untuk mendukung tumbuh kembang anak-anak di Jakarta Pusat.
              </p>
            </div>
            <div className="relative">
              <img
                src="/modern-community-center-building-with-children-and.jpg"
                alt="Gedung RPTRA Kebon Melati"
                className="w-full h-80 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Misi Kami</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Menyediakan ruang publik yang aman dan nyaman untuk anak-anak</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Mengembangkan program edukatif yang mendukung tumbuh kembang anak</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Membangun komunitas yang peduli terhadap kesejahteraan anak</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Memberikan akses fasilitas berkualitas untuk seluruh masyarakat</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader className="pb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Visi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  Menjadi pusat kegiatan masyarakat yang terdepan dalam menciptakan lingkungan ramah anak, mendorong
                  partisipasi aktif keluarga, dan membangun generasi yang cerdas, kreatif, dan berkarakter di Jakarta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">Nilai-Nilai Kami</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Prinsip-prinsip yang menjadi landasan dalam setiap kegiatan dan pelayanan kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Peduli",
                description: "Mengutamakan kepentingan dan kesejahteraan anak-anak dalam setiap program",
              },
              {
                icon: Users,
                title: "Inklusif",
                description: "Menerima dan melayani seluruh lapisan masyarakat tanpa diskriminasi",
              },
              {
                icon: Award,
                title: "Berkualitas",
                description: "Memberikan pelayanan dan fasilitas terbaik dengan standar tinggi",
              },
            ].map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pretty">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">Kunjungi Kami</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Kami siap melayani Anda dan keluarga setiap hari dengan berbagai fasilitas dan kegiatan menarik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Alamat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Jl. Kebon Melati No. 123
                  <br />
                  Jakarta Pusat, DKI Jakarta 10230
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Jam Operasional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-muted-foreground">Senin - Jumat: 06:00 - 21:00</p>
                <p className="text-muted-foreground">Sabtu - Minggu: 06:00 - 22:00</p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">(021) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">info@rptrakebon melati.id</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/kontak">Hubungi Kami Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
