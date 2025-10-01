"use client";

import { useState, useEffect } from "react";
import { RequestData } from "@/types/types";
import { 
  Check, 
  X, 
  Clock, 
  MoreHorizontal, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Users, 
  User,
  Phone,
  Building,
  Target,
  BadgeIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface RequestListProps {
  selectedDate?: string | null;
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

// Reusable Snackbar Component
const Snackbar: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const RequestList: React.FC<RequestListProps> = ({ selectedDate }) => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/request", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data: RequestData[] = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (request: RequestData, newStatus: string) => {
    try {
      const response = await fetch("/api/request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: request._id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r._id === request._id
            ? { ...r, status: newStatus as RequestData["status"] }
            : r
        )
      );

      setSnackbar({ message: `Status updated to ${newStatus}`, type: "success" });
    } catch (err) {
      console.error("Error updating status:", err);
      setSnackbar({ message: "Failed to update status", type: "error" });
    }
  };

  const openModal = (request: RequestData) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <Card className="shadow-md rounded-xl overflow-hidden">
        <div className="p-6 text-center animate-pulse">
          Memuat data permintaan...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md rounded-xl overflow-hidden bg-red-50 border-red-200">
        <div className="p-6 text-red-700">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <div className="shadow-md rounded-xl overflow-hidden">
      <CardHeader className="border-b p-6">
        <h2 className="text-xl font-semibold text-gray-900">Daftar Permintaan</h2>
      </CardHeader>

      <CardContent className="p-0">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada permintaan saat ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Instansi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Peminjam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors border-b last:border-b-0">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.namaInstansi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.namaPeminjam}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.tanggalPelaksanaan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${STATUS_COLORS[request.status || "pending"]} rounded-full px-3 py-1 shadow-sm`}>
                        {request.status || "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Select
                          value={request.status || "pending"}
                          onValueChange={(newStatus) => handleStatusUpdate(request, newStatus)}
                        >
                          <SelectTrigger className="w-[140px] shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(request)}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <MoreHorizontal className="w-4 h-4 mr-2" />
                          Lihat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Modal for Viewing Request Details */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Detail Permintaan</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Instansi</p>
                  <p className="font-medium text-gray-900">{selectedRequest.namaInstansi}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Peminjam</p>
                  <p className="font-medium text-gray-900">{selectedRequest.namaPeminjam}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-900">{selectedRequest.alamat}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">No Telepon</p>
                  <p className="font-medium text-gray-900">{selectedRequest.noTelp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Jumlah Peserta</p>
                  <p className="font-medium text-gray-900">{selectedRequest.jumlahPeserta}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Waktu Penggunaan</p>
                  <p className="font-medium text-gray-900">{selectedRequest.waktuPenggunaan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Penggunaan Ruangan</p>
                  <p className="font-medium text-gray-900">{selectedRequest.penggunaanRuangan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Tujuan Penggunaan</p>
                  <p className="font-medium text-gray-900">{selectedRequest.tujuanPenggunaan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BadgeIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">{selectedRequest.status}</p>
                </div>
              </div>
            </div>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-4 shadow-sm hover:shadow-md transition-shadow">Tutup</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

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

export default RequestList;
