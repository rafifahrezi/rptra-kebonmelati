export type Language = "id" | "en"

export interface Translations {
  [key: string]: string | Translations
}

export const translations: Record<Language, Translations> = {
  id: {
    nav: {
      home: "Beranda",
      about: "Tentang Kami",
      events: "Kegiatan",
      news: "Berita",
      gallery: "Galeri",
      contact: "Kontak",
    },
    home: {
      hero: {
        badge: "Ruang Publik Terpadu Ramah Anak",
        title: "Selamat Datang di RPTRA Kebon Melati",
        description:
          "Ruang publik yang aman, nyaman, dan ramah anak untuk seluruh keluarga. Bergabunglah dengan komunitas yang peduli terhadap tumbuh kembang anak-anak Jakarta.",
        viewEvents: "Lihat Kegiatan",
        aboutUs: "Tentang Kami",
        activeMembers: "Anggota Aktif",
        monthlyEvents: "Kegiatan/Bulan",
      },
      features: {
        title: "Fasilitas & Kegiatan Unggulan",
        description:
          "Berbagai fasilitas dan program kegiatan yang dirancang khusus untuk mendukung tumbuh kembang anak dan keharmonisan keluarga.",
        playground: {
          title: "Area Bermain",
          description: "Playground aman dengan berbagai permainan edukatif untuk anak-anak",
        },
        library: {
          title: "Perpustakaan",
          description: "Koleksi buku anak dan ruang baca yang nyaman untuk keluarga",
        },
        art: {
          title: "Kelas Seni",
          description: "Workshop melukis, kerajinan tangan, dan aktivitas kreatif lainnya",
        },
        music: {
          title: "Musik & Tari",
          description: "Pembelajaran musik tradisional dan modern untuk semua usia",
        },
      },
      stats: {
        members: "Anggota Aktif",
        events: "Kegiatan per Bulan",
        programs: "Program Unggulan",
        years: "Tahun Beroperasi",
      },
      cta: {
        title: "Bergabunglah dengan Komunitas Kami",
        description:
          "Daftarkan diri Anda dan keluarga untuk menjadi bagian dari komunitas RPTRA Kebon Melati dan nikmati berbagai kegiatan menarik setiap harinya.",
        contact: "Hubungi Kami",
        schedule: "Lihat Jadwal Kegiatan",
      },
    },
    footer: {
      description: "Menyediakan ruang publik yang aman, nyaman, dan ramah anak untuk seluruh masyarakat Jakarta.",
      quickLinks: "Tautan Cepat",
      contact: "Kontak",
      hours: "Jam Operasional",
      followUs: "Ikuti Kami",
      copyright: "© 2024 RPTRA Kebon Melati. Semua hak dilindungi undang-undang.",
      weekdays: "Senin - Jumat: 06:00 - 21:00",
      weekends: "Sabtu - Minggu: 06:00 - 22:00",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About Us",
      events: "Events",
      news: "News",
      gallery: "Gallery",
      contact: "Contact",
    },
    home: {
      hero: {
        badge: "Child-Friendly Integrated Public Space",
        title: "Welcome to RPTRA Kebon Melati",
        description:
          "A safe, comfortable, and child-friendly public space for the whole family. Join our community that cares about the growth and development of Jakarta's children.",
        viewEvents: "View Events",
        aboutUs: "About Us",
        activeMembers: "Active Members",
        monthlyEvents: "Events/Month",
      },
      features: {
        title: "Featured Facilities & Activities",
        description:
          "Various facilities and activity programs specifically designed to support children's growth and family harmony.",
        playground: {
          title: "Playground",
          description: "Safe playground with various educational games for children",
        },
        library: {
          title: "Library",
          description: "Children's book collection and comfortable reading space for families",
        },
        art: {
          title: "Art Classes",
          description: "Painting workshops, handicrafts, and other creative activities",
        },
        music: {
          title: "Music & Dance",
          description: "Traditional and modern music learning for all ages",
        },
      },
      stats: {
        members: "Active Members",
        events: "Events per Month",
        programs: "Featured Programs",
        years: "Years Operating",
      },
      cta: {
        title: "Join Our Community",
        description:
          "Register yourself and your family to become part of the RPTRA Kebon Melati community and enjoy various exciting activities every day.",
        contact: "Contact Us",
        schedule: "View Event Schedule",
      },
    },
    footer: {
      description: "Providing safe, comfortable, and child-friendly public spaces for all Jakarta residents.",
      quickLinks: "Quick Links",
      contact: "Contact",
      hours: "Operating Hours",
      followUs: "Follow Us",
      copyright: "© 2024 RPTRA Kebon Melati. All rights reserved.",
      weekdays: "Monday - Friday: 06:00 - 21:00",
      weekends: "Saturday - Sunday: 06:00 - 22:00",
    },
  },
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".")
  let value: any = translations[lang]

  for (const k of keys) {
    value = value?.[k]
  }

  return typeof value === "string" ? value : key
}
