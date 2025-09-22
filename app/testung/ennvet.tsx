import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react"

// Mock data for events
const events = [
  {
    id: 1,
    title: "Workshop Melukis untuk Anak",
    description: "Kegiatan melukis kreatif untuk mengembangkan bakat seni anak-anak usia 5-12 tahun",
    date: "2024-01-15",
    time: "09:00 - 11:00",
    location: "Ruang Seni RPTRA",
    capacity: 20,
    registered: 15,
    category: "Seni",
    image: "/children-painting-workshop-in-bright-colorful-room.jpg",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Senam Pagi Keluarga",
    description: "Olahraga ringan untuk seluruh keluarga setiap hari Minggu pagi",
    date: "2024-01-14",
    time: "06:30 - 07:30",
    location: "Lapangan RPTRA",
    capacity: 50,
    registered: 35,
    category: "Olahraga",
    image: "/family-morning-exercise-in-park-setting.jpg",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Dongeng Interaktif",
    description: "Sesi bercerita interaktif dengan boneka tangan dan permainan edukatif",
    date: "2024-01-16",
    time: "15:00 - 16:00",
    location: "Perpustakaan RPTRA",
    capacity: 25,
    registered: 20,
    category: "Edukasi",
    image: "/interactive-storytelling-session-with-children.jpg",
    status: "upcoming",
  },
  {
    id: 4,
    title: "Kelas Memasak Anak",
    description: "Belajar memasak makanan sehat dan bergizi untuk anak-anak",
    date: "2024-01-12",
    time: "10:00 - 12:00",
    location: "Dapur Komunal",
    capacity: 15,
    registered: 15,
    category: "Kuliner",
    image: "/children-cooking-class-healthy-food.jpg",
    status: "completed",
  },
]

export default function EventsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Kegiatan & <span className="text-primary">Program</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Ikuti berbagai kegiatan menarik dan edukatif yang kami selenggarakan setiap minggu untuk seluruh keluarga.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Cari kegiatan..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="seni">Seni</SelectItem>
              <SelectItem value="olahraga">Olahraga</SelectItem>
              <SelectItem value="edukasi">Edukasi</SelectItem>
              <SelectItem value="kuliner">Kuliner</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="upcoming">Akan Datang</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                    {event.status === "upcoming" ? "Akan Datang" : "Selesai"}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-background/80">
                    {event.category}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg text-balance">{event.title}</CardTitle>
                <CardDescription className="text-pretty">{event.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.registered}/{event.capacity} peserta
                    </span>
                  </div>
                </div>

                {event.status === "upcoming" && (
                  <Button className="w-full" disabled={event.registered >= event.capacity}>
                    {event.registered >= event.capacity ? "Penuh" : "Daftar Sekarang"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12 bg-card/50 rounded-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
            Ingin Mengusulkan Kegiatan Baru?
          </h2>
          <p className="text-muted-foreground text-pretty max-w-xl mx-auto">
            Kami selalu terbuka untuk ide-ide kegiatan baru yang bermanfaat untuk komunitas. Sampaikan usulan Anda!
          </p>
          <Button size="lg" asChild>
            <Link href="/kontak">Kirim Usulan</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
