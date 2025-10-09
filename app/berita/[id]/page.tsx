"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, RefreshCw, AlertCircle } from "lucide-react";

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

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/news/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Berita tidak ditemukan");
          }
          throw new Error(`HTTP ${res.status}: Gagal mengambil berita`);
        }
        const data: NewsItem = await res.json();
        setNews(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
        setError(errorMessage);
        console.error('News detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id]);

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
          <Button asChild>
            <Link href="/berita">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Berita
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // No news found
  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Berita Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Berita yang Anda cari tidak tersedia.</p>
          <Button asChild>
            <Link href="/berita">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Berita
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/berita">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Berita
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{news.category || "Tanpa Kategori"}</Badge>
            {news.featured && <Badge className="bg-primary">Berita Utama</Badge>}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-foreground text-balance mb-4">
            {news.title}
          </h1>

          {news.subtitle && (
            <p className="text-xl text-muted-foreground text-balance mb-6">
              {news.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{news.author || "Anonim"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(news.createdAt).toLocaleDateString("id-ID", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {news.images && news.images.length > 0 && (
          <div className="mb-8">
            <img
              src={news.images[0]}
              alt={news.title}
              className="w-full max-h-96 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <ReactMarkdown
              components={{
                // Custom component untuk styling
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                // img: ({node, ...props}) => (
                //   <OptimizedImage 
                //     src={props.src || ''} 
                //     alt={props.alt || ''} 
                //     className="rounded-lg my-4 max-w-full" 
                //   />
                // )
              }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {news.content}
            </ReactMarkdown>
          </CardContent>
        </Card>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tag</h3>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Images */}
        {news.images && news.images.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Galeri Gambar</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {news.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${news.title} - Gambar ${index + 2}`}
                  className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Back to News */}
        <div className="text-center">
          <Button asChild>
            <Link href="/berita">
              Lihat Berita Lainnya
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
