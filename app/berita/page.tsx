"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Calendar, User, Search, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"

interface NewsItem {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  author?: string;
  featured: boolean;
  published: boolean;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch news data
  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Gagal mengambil data berita`);
      }
      const data: NewsItem[] = await res.json();
      setNews(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
      setError(errorMessage);
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Memoized computations
  const publishedNews = useMemo(() => news.filter(item => item.published), [news]);

  const featuredNews = useMemo(() => publishedNews.find(item => item.featured), [publishedNews]);

  const categories = useMemo(() => [
    "all",
    ...Array.from(new Set(publishedNews.map(item => item.category).filter((cat): cat is string => Boolean(cat)))),
  ], [publishedNews]);

  const filteredNews = useMemo(() => {
    return publishedNews.filter(item => {
      if (item.featured) return false; // Exclude featured from regular list

      const matchesCategory = selectedCategory === "all" || item.category?.toLowerCase() === selectedCategory;

      const matchesSearch = searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [publishedNews, selectedCategory, searchTerm]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Berita</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={fetchNews} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </Button>
        </div>
      </div>
    );
  }

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
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-square relative">
                  <img
                    src={featuredNews.images?.[0] || "/placeholder.svg"}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">Berita Utama</Badge>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <Badge variant="outline">{featuredNews.category || "Tanpa Kategori"}</Badge>
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
                      {featuredNews.title}
                    </h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">{featuredNews.subtitle || featuredNews.content.substring(0, 100) + "..."}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{featuredNews.author || "Anonim"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredNews.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/berita/${featuredNews._id}`}>
                        Baca Selengkapnya
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari berita..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.filter(cat => cat !== "all").map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredNews.map((article) => (
            <Card key={article._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={article.images?.[0] || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="outline" className="bg-background/80">
                    {article.category || "Tanpa Kategori"}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg text-balance line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="text-pretty line-clamp-3">{article.subtitle || article.content.substring(0, 100) + "..."}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.createdAt).toLocaleDateString("id-ID")}</span>
                </div>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/berita/${article._id}`}>Baca Selengkapnya</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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
  )
}
