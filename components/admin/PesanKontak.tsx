"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Phone, 
  Filter,
  Search,
  Eye,
  Trash2,
  MessageSquare,
  AlertCircle,
  Clock,
  MoreVertical
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Tipe yang sama dengan sebelumnya, dengan tambahan status
interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  status?: 'unread' | 'read';
}

// Utility Functions
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Baru saja";
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  return format(date, "dd MMM yyyy", { locale: id });
};

const getCategoryColor = (category: string) => {
  const colors = {
    umum: "bg-gray-100 text-gray-800 border-gray-200",
    keluhan: "bg-red-100 text-red-800 border-red-200",
    saran: "bg-blue-100 text-blue-800 border-blue-200",
    partnership: "bg-purple-100 text-purple-800 border-purple-200",
    lainnya: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[category as keyof typeof colors] || colors.umum;
};

// MessageCard Component
const MessageCard: React.FC<{
  message: ContactMessage;
  onView: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
  isDeleting: boolean;
}> = memo(({ message, onView, onDelete, isDeleting }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className={getCategoryColor(message.category)}>
                {message.category}
              </Badge>
              {message.status === "unread" && (
                <Badge variant="default" className="bg-blue-500 text-white">
                  Baru
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 mb-2">
              {message.subject}
            </h3>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32">
                <button
                  onClick={() => {
                    onView(message);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Lihat Detail
                </button>
                <button
                  onClick={() => {
                    onDelete(message);
                    setShowActions(false);
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sender Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{message.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{message.email}</span>
          </div>
          {message.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{message.phone}</span>
            </div>
          )}
        </div>

        {/* Message Preview */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {message.message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <time dateTime={message.createdAt}>
              {getTimeAgo(message.createdAt)}
            </time>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(message)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Baca Selengkapnya
          </Button>
        </div>
      </div>
    </Card>
  );
});

// MessageDetailModal Component
const MessageDetailModal: React.FC<{
  message: ContactMessage | null;
  onClose: () => void;
  onDelete: (message: ContactMessage) => void;
}> = memo(({ message, onClose, onDelete }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                {message.subject}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Diterima {formatDateForDisplay(message.createdAt)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Sender Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium text-gray-900">{message.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{message.email}</p>
              </div>
            </div>
            {message.phone && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <p className="font-medium text-gray-900">{message.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Filter className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Kategori</p>
              <Badge variant="secondary" className={getCategoryColor(message.category)}>
                {message.category}
              </Badge>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Isi Pesan</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            ID Pesan: <span className="font-mono">{message._id}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Tutup
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(message)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Pesan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
});

// DeleteConfirmationModal Component
const DeleteConfirmationModal: React.FC<{
  message: ContactMessage | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = memo(({ message, onConfirm, onCancel, isDeleting }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hapus Pesan</h3>
            <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            Anda akan menghapus pesan dari <strong className="text-red-800">{message.name}</strong>
          </p>
          <p className="text-sm font-medium text-red-800 mt-1 line-clamp-2">
            "{message.subject}"
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Pesan
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
});

// Main Component (rests of the code remains the same)

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil pesan');
      }

      const data: ContactMessage[] = await response.json();
      
      // Tambahkan status default jika tidak ada
      const processedMessages = data.map(msg => ({
        ...msg,
        status: msg.status || 'unread'
      }));

      setMessages(processedMessages);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filter messages
  useEffect(() => {
    let filtered = [...messages];
    
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(msg => msg.category === selectedCategory);
    }
    
    setFilteredMessages(filtered);
  }, [messages, searchTerm, selectedCategory]);

  // Kategori dinamis berdasarkan data
  const CATEGORIES = [
    { 
      value: "all", 
      label: "Semua Kategori", 
      count: messages.length 
    },
    ...Array.from(new Set(messages.map(m => m.category)))
      .map(category => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count: messages.filter(m => m.category === category).length
      }))
  ];

  // Stats calculation
  const stats = {
    total: messages.length,
    unread: messages.filter(msg => msg.status === "unread").length,
    categories: CATEGORIES.reduce((acc, cat) => {
      if (cat.value !== "all") {
        acc[cat.value] = messages.filter(msg => msg.category === cat.value).length;
      }
      return acc;
    }, {} as { [key: string]: number })
  };

  // Handler untuk menghapus pesan
  const handleDeleteMessage = async (message: ContactMessage) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contact/${message._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus pesan');
      }

      // Perbarui state setelah penghapusan berhasil
      setMessages(prev => prev.filter(msg => msg._id !== message._id));
      setSelectedMessage(null);
      setMessageToDelete(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      // Tambahkan handling error (misalnya tampilkan snackbar)
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler untuk melihat detail pesan
  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Jika pesan belum dibaca, kirim request untuk update status
    if (message.status === "unread") {
      try {
        const response = await fetch(`/api/contact/${message._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'read' })
        });

        if (response.ok) {
          // Update status di local state
          setMessages(prev => 
            prev.map(msg => 
              msg._id === message._id ? { ...msg, status: 'read' } : msg
            )
          );
        }
      } catch (err) {
        console.error('Error updating message status:', err);
      }
    }
  };

  // Render loading atau error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Gagal Memuat Pesan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchMessages}>Coba Lagi</Button>
        </Card>
      </div>
    );
  }

  // Render utama (sama seperti sebelumnya)
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden my-12">
      {/* Header dan konten tetap sama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <Card className="p-6 mb-8">
          {/* Filter dan search */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pesan
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama, email, subjek, atau isi pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kategori
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || selectedCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="whitespace-nowrap"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </Card>

        {/* Render pesan */}
        {filteredMessages.length === 0 ? (
          <Card className="text-center py-16">
            {/* Tampilan saat tidak ada pesan */}
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {messages.length === 0 ? "Belum ada pesan" : "Tidak ada pesan yang sesuai"}
              </h3>
              <p className="text-gray-600 mb-6">
                {messages.length === 0 
                  ? "Pesan dari pengunjung akan muncul di sini" 
                  : "Coba ubah kata kunci pencarian atau filter yang Anda gunakan"
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredMessages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                onView={handleViewMessage}
                onDelete={handleDeleteMessage}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onDelete={handleDeleteMessage}
      />

      <DeleteConfirmationModal
        message={messageToDelete}
        onConfirm={() => handleDeleteMessage(messageToDelete!)}
        onCancel={() => setMessageToDelete(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
};

export default ContactMessagesPage;
