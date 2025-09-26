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
    <div className="min-h-screen">
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Berita & Informasi</h1>
            <p className="text-xl opacity-90 mb-8">Ikuti perkembangan terbaru, program-program baru, dan berbagai informasi penting dari RPTRA Kebon Melati.</p>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}


        {/* Featured News */}
        {featuredNews && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 my-5">Berita Utama</h2>
            <Card className="overflow-hidden hover:shadow-sm transition-shadow border-subtle max-w-10xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-[4/3] relative">
                  <img
                    src={featuredNews.images?.[0] || "/placeholder.svg"}
                    alt={featuredNews.title}
                    className="w-full h-full ml-5 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className="bg-primary/90 text-primary-foreground hover:bg-primary/80 
            px-2 py-1 rounded-full text-xs font-medium"
                    >
                      Berita Utama
                    </Badge>
                  </div>
                </div>
                <div className="p-5 md:p-6 ml-5 flex flex-col justify-center space-y-3">
                  <Badge
                    variant="outline"
                    className="self-start text-xs px-2 py-1 rounded-full"
                  >
                    {featuredNews.category || "Tanpa Kategori"}
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground line-clamp-2">
                    {featuredNews.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {featuredNews.subtitle || featuredNews.content.substring(0, 150) + "..."}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 opacity-70" />
                      <span>{featuredNews.author || "Anonim"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>
                        {new Date(featuredNews.createdAt).toLocaleDateString("id-ID", {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="self-start mt-3 group"
                  >
                    <Link href={`/berita/${featuredNews._id}`}>
                      Baca Selengkapnya
                      <ArrowRight
                        className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </Button>
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
      </div>
    </div>
  )
}
