"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  MessageSquare, 
  X, 
  Clock,
  Mail,
  User,
  Phone,
  Search,
  Filter
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

type SnackbarType = "success" | "error" | "info";

// Format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
};

// Category badge colors
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    umum: "bg-gray-100 text-gray-800 border-gray-200",
    keluhan: "bg-red-100 text-red-800 border-red-200",
    saran: "bg-blue-100 text-blue-800 border-blue-200",
    partnership: "bg-purple-100 text-purple-800 border-purple-200",
    lainnya: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[category] || colors["umum"];
};

// Confirm Delete Modal
const ConfirmDeleteModal: React.FC<{
  contact: Contact | null;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}> = ({ contact, onCancel, onConfirm, deleting }) => {
  if (!contact) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <Card className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 id="delete-title" className="text-lg font-semibold text-gray-900">
              Hapus Pesan
            </h2>
            <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Anda akan menghapus pesan dari <strong className="text-red-600">{contact.name}</strong>
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">"{contact.subject}"</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={deleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Snackbar Component
const Snackbar: React.FC<{
  message: string;
  onClose: () => void;
  type?: SnackbarType;
}> = ({ message, onClose, type = "info" }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500 text-white border-green-600",
    error: "bg-red-500 text-white border-red-600",
    info: "bg-blue-500 text-white border-blue-600"
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 min-w-80 max-w-md ${colors[type]}`}
      role="alert"
    >
      <span className="flex-1 text-sm font-medium">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

// Contact Card Component
const ContactCard: React.FC<{
  contact: Contact;
  onDelete: (contact: Contact) => void;
  deleting: boolean;
}> = ({ contact, onDelete, deleting }) => {
  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge 
            variant="secondary" 
            className={getCategoryColor(contact.category)}
          >
            {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact)}
            disabled={deleting}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            aria-label={`Hapus pesan dari ${contact.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Subject */}
        <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2">
          {contact.subject}
        </h3>

        {/* Sender Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{contact.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Message Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {contact.message}
          </p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500 pt-4 border-t border-gray-100">
          <Clock className="w-3 h-3" />
          <time dateTime={contact.createdAt}>
            {formatDateForDisplay(contact.createdAt)}
          </time>
        </div>
      </div>
    </Card>
  );
};

// Main Component
const ContactManagementPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type?: SnackbarType } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Categories for filter
  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "umum", label: "Umum" },
    { value: "keluhan", label: "Keluhan" },
    { value: "saran", label: "Saran" },
    { value: "partnership", label: "Partnership" },
    { value: "lainnya", label: "Lainnya" },
  ];

  // Load contacts with proper error handling
  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/contact", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: Gagal memuat pesan`);
      }

      const data = await response.json();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat pesan";
      setError(msg);
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Apply filters
  useEffect(() => {
    let filtered = [...contacts];
    
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.subject.toLowerCase().includes(query) ||
        contact.message.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(contact => contact.category === selectedCategory);
    }
    
    setFilteredContacts(filtered);
  }, [contacts, searchTerm, selectedCategory]);

  // Delete contact with proper API call
  const handleDeleteContact = useCallback(async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/contact/${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: Gagal menghapus pesan`);
      }

      const result = await response.json();
      
      setSnackbar({ 
        message: result.message || "Pesan berhasil dihapus!", 
        type: "success" 
      });
      
      // Refresh the list
      await loadContacts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus pesan";
      setSnackbar({ message: msg, type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadContacts]);

  // Statistics
  const stats = {
    total: contacts.length,
    categories: categories.reduce((acc, cat) => {
      if (cat.value !== "all") {
        acc[cat.value] = contacts.filter(c => c.category === cat.value).length;
      }
      return acc;
    }, {} as { [key: string]: number })
  };

  if (loading) {
    return (
      <LoadingState 
        title="Memuat pesan kontak..." 
        description="Sedang mengambil data pesan dari pengunjung" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Pesan</h1>
                <p className="text-gray-600 mt-1">Kelola pesan dari pengunjung RPTRA Bonti</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-500">Total Pesan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1 w-full">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pesan
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama, email, subjek, atau pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kategori
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} {category.value !== "all" && `(${stats.categories[category.value] || 0})`}
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

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredContacts.length} Pesan Ditemukan
          </h2>
          {(searchTerm || selectedCategory !== "all") && (
            <p className="text-sm text-gray-600 mt-1">
              Hasil filter {searchTerm && `untuk "${searchTerm}"`} 
              {searchTerm && selectedCategory !== "all" && " dan "}
              {selectedCategory !== "all" && `kategori ${categories.find(c => c.value === selectedCategory)?.label?.toLowerCase()}`}
            </p>
          )}
        </div>

        {/* Contact List */}
        {error ? (
          <Card className="bg-red-50 border-red-200 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Gagal Memuat Pesan</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadContacts} variant="outline">
              Coba Lagi
            </Button>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {contacts.length === 0 ? "Belum ada pesan" : "Tidak ada pesan yang sesuai"}
            </h3>
            <p className="text-gray-600">
              {contacts.length === 0 
                ? "Pesan dari pengunjung akan muncul di sini" 
                : "Coba ubah kata kunci pencarian atau filter yang Anda gunakan"
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onDelete={setDeleteTarget}
                deleting={deleting}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <ConfirmDeleteModal
        contact={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteContact}
        deleting={deleting}
      />

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default ContactManagementPage;