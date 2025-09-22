import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Calendar, User, Eye, Search, ArrowRight } from "lucide-react";

// Define NewsItem interface
interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  views: number;
  featured: boolean;
}

// Reusable Loading Component
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600">Memuat berita...</p>
    </div>
  </div>
);

// Reusable Error Component
const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-xl mb-4">⚠️</div>
      <p className="text-gray-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
      >
        Muat Ulang
      </button>
    </div>
  </div>
);

// Featured News Component
const FeaturedNews = ({ news }: { news: NewsItem }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      <div className="aspect-video lg:aspect-square relative">
        <img
          src={news.image || "/placeholder.svg"}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground">Berita Utama</Badge>
        </div>
      </div>
      <div className="p-8 flex flex-col justify-center">
        <div className="space-y-4">
          <Badge variant="outline">{news.category}</Badge>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">{news.title}</h3>
          <p className="text-muted-foreground text-pretty leading-relaxed">{news.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{news.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(news.date).toLocaleDateString("id-ID")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{news.views} views</span>
            </div>
          </div>
          <Button asChild>
            <Link href={`/berita/${news.id}`}>
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </Card>
);

// Regular News Component
const RegularNews = ({ news }: { news: NewsItem[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
    {news.map((article) => (
      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-background/80">
              {article.category}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg text-balance line-clamp-2">{article.title}</CardTitle>
          <CardDescription className="text-pretty line-clamp-3">{article.excerpt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(article.date).toLocaleDateString("id-ID")}</span>
          </div>
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href={`/berita/${article.id}`}>Baca Selengkapnya</Link>
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);
  const [regularNews, setRegularNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch news from API
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error(await response.text() || "Gagal mengambil berita");
      }
      const data: NewsItem[] = await response.json();
      const featured = data.find((item) => item.featured) || null;
      const regular = data.filter((item) => !item.featured);
      setFeaturedNews(featured);
      setRegularNews(regular);
      setNews(data); // Store full list for potential future filtering
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Berita & <span className="text-primary">Informasi</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Ikuti perkembangan terbaru, program-program baru, dan berbagai informasi penting dari RPTRA Kebon Melati.
          </p>
        </div>

        {/* Featured News */}
        {featuredNews && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Berita Utama</h2>
            <FeaturedNews news={featuredNews} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Cari berita..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="penghargaan">Penghargaan</SelectItem>
              <SelectItem value="program-baru">Program Baru</SelectItem>
              <SelectItem value="fasilitas">Fasilitas</SelectItem>
              <SelectItem value="acara">Acara</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News Grid */}
        <RegularNews news={regularNews} />

        {/* Newsletter Signup */}
        <div className="text-center space-y-6 py-12 bg-primary text-primary-foreground rounded-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-balance">Dapatkan Berita Terbaru</h2>
          <p className="opacity-90 text-pretty max-w-xl mx-auto">
            Berlangganan newsletter kami untuk mendapatkan informasi terbaru tentang kegiatan dan program RPTRA Kebon
            Melati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input placeholder="Masukkan email Anda" className="bg-primary-foreground text-foreground" />
            <Button variant="secondary" size="lg">
              Berlangganan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}