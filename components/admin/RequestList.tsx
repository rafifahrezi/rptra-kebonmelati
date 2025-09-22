"use client";

import React, { useState, useEffect } from "react";
import { RequestData } from "@/types/types";
import { 
  Check, 
  X, 
  Clock, 
  MoreHorizontal, 
  Edit2, 
  Trash2 
} from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/request", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data: RequestData[] = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching requests:', err);
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request._id,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Optimistic update
      setRequests(prev => 
        prev.map(r => 
          r._id === request._id 
            ? { ...r, status: newStatus as RequestData['status'] } 
            : r
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      // Optionally show error notification
    }
  };

  const renderStatusActions = (request: RequestData) => {
    const baseClasses = "p-1 rounded-full hover:bg-gray-200 transition-colors";
    
    return (
      <div className="flex items-center space-x-2">
        {request.status !== 'completed' && (
          <button 
            onClick={() => handleStatusUpdate(request, 'completed')}
            className={`${baseClasses} text-green-600 hover:bg-green-100`}
            title="Mark as Completed"
          >
            <Check className="w-5 h-5" />
          </button>
        )}
        
        {request.status !== 'cancelled' && (
          <button 
            onClick={() => handleStatusUpdate(request, 'cancelled')}
            className={`${baseClasses} text-red-600 hover:bg-red-100`}
            title="Cancel Request"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {request.status !== 'scheduled' && (
          <button 
            onClick={() => handleStatusUpdate(request, 'scheduled')}
            className={`${baseClasses} text-blue-600 hover:bg-blue-100`}
            title="Schedule Request"
          >
            <Clock className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="animate-pulse">Memuat data permintaan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Daftar Permintaan</h2>
      </div>
      
      {requests.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Tidak ada permintaan saat ini
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instansi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peminjam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.namaInstansi}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {request.namaPeminjam}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {request.tanggalPelaksanaan}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${STATUS_COLORS[request.status || 'pending']}`}
                    >
                      {request.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {renderStatusActions(request)}
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        title="Detail"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestList;
