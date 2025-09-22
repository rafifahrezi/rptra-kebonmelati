"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, Users, TrendingUp, Calendar, BarChart3, AlertCircle, RefreshCw } from "lucide-react";
import StatsCard from "./StatsCard";
import { DateUtils } from "@/utils/dateUtils";
import { VisitDataFromAPI, ProcessedVisit } from "@/types/types";

const VISITOR_FIELDS = [
  { key: "balita", label: "Balita", description: "0-5 tahun", color: "bg-pink-100 text-pink-700" },
  { key: "anak", label: "Anak", description: "6-12 tahun", color: "bg-blue-100 text-blue-700" },
  { key: "remaja", label: "Remaja", description: "13-17 tahun", color: "bg-green-100 text-green-700" },
  { key: "dewasa", label: "Dewasa", description: "18-59 tahun", color: "bg-purple-100 text-purple-700" },
  { key: "lansia", label: "Lansia", description: "60+ tahun", color: "bg-orange-100 text-orange-700" },
] as const;

interface VisitsSectionProps {
  showHeader?: boolean;
  showCTACard?: boolean;
  initialPageSize?: number;
}

const VisitsSection: React.FC<VisitsSectionProps> = ({ 
  showHeader = true, 
  showCTACard = true,
  initialPageSize = 10 
}) => {
  const [visits, setVisits] = useState<VisitDataFromAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const perPage = initialPageSize;

  // Process raw API data into structured format
  const processedVisits: ProcessedVisit[] = useMemo(() => {
    return visits.map((visit) => {
      const balita = typeof visit.balita === 'number' ? visit.balita : Number(visit.balita) || 0;
      const anak = typeof visit.anak === 'number' ? visit.anak : Number(visit.anak) || 0;
      const remaja = typeof visit.remaja === 'number' ? visit.remaja : Number(visit.remaja) || 0;
      const dewasa = typeof visit.dewasa === 'number' ? visit.dewasa : Number(visit.dewasa) || 0;
      const lansia = typeof visit.lansia === 'number' ? visit.lansia : Number(visit.lansia) || 0;

      return {
        id: visit.id,
        date: visit.date,
        balita,
        anak,
        remaja,
        dewasa,
        lansia,
        total: balita + anak + remaja + dewasa + lansia,
      };
    });
  }, [visits]);

  // Fetch visits from API
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/analytics", {
        credentials: "include",
        cache: "no-store",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch visits`);
      }
      
      const data = await res.json();
      
      const mappedVisits: VisitDataFromAPI[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item._id || item.id,
            date: item.date,
            balita: item.balita ?? 0,
            anak: item.anak ?? 0,
            remaja: item.remaja ?? 0,
            dewasa: item.dewasa ?? 0,
            lansia: item.lansia ?? 0,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        : [];

      setVisits(mappedVisits);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      console.error("Fetch visits error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Sort and paginate visits
  const sortedVisits = useMemo(() => {
    return [...processedVisits].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      return sortOrder === 'desc' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [processedVisits, sortOrder]);

  const totalPages = Math.ceil(sortedVisits.length / perPage);
  const paginatedVisits = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedVisits.slice(start, start + perPage);
  }, [sortedVisits, page, perPage]);

  // Auto-adjust page if needed
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalVisitors = processedVisits.reduce((sum, visit) => sum + visit.total, 0);
    const averagePerDay = processedVisits.length > 0 ? Math.round(totalVisitors / processedVisits.length) : 0;
    const highestDay = processedVisits.reduce((max, visit) => visit.total > max.total ? visit : max, { total: 0, date: '', id: '' });

    return {
      totalVisitors: totalVisitors.toLocaleString('id-ID'),
      totalDays: processedVisits.length.toLocaleString('id-ID'),
      averagePerDay: averagePerDay.toLocaleString('id-ID'),
      highestDay: {
        count: highestDay.total.toLocaleString('id-ID'),
        date: highestDay.date ? DateUtils.formatDateOnly(highestDay.date) : '-',
      },
    };
  }, [processedVisits]);

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Memuat data kunjungan...</p>
              <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-red-100 max-w-md">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={fetchVisits}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {showHeader && (
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Statistik Kunjungan RPTRA
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ringkasan komprehensif data pengunjung berdasarkan kategori usia dengan 
              perbandingan periode waktu yang akurat dan real-time.
            </p>
            
            {/* Summary Statistics */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">{summaryStats.totalVisitors}</div>
                <div className="text-sm text-gray-500">Total Kunjungan</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">{summaryStats.totalDays}</div>
                <div className="text-sm text-gray-500">Hari Tercatat</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">{summaryStats.averagePerDay}</div>
                <div className="text-sm text-gray-500">Rata-rata Harian</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-orange-600">{summaryStats.highestDay.count}</div>
                <div className="text-sm text-gray-500">Tertinggi ({summaryStats.highestDay.date})</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Mingguan" visits={processedVisits} color="purple" />
            <StatsCard title="Bulanan" visits={processedVisits} color="blue" />
            <StatsCard title="Tahunan" visits={processedVisits} color="green" />
            
            {showCTACard && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center mb-4 flex-1 flex flex-col justify-center">
                  <h3 className="text-gray-800 font-semibold mb-2">
                    Permohonan Penggunaan RPTRA
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ajukan permohonan untuk menggunakan fasilitas RPTRA
                  </p>
                </div>
                <a
                  href="/permohonan"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Ajukan Permohonan</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Data Kunjungan Harian</h3>
                <p className="text-sm text-gray-600">
                  Menampilkan {paginatedVisits.length} dari {sortedVisits.length} total data
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                </button>
                
                <button
                  onClick={fetchVisits}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Tanggal
                  </th>
                  {VISITOR_FIELDS.map(({ key, color }) => (
                    <th
                      key={key}
                      className="px-4 py-4 text-center text-sm font-semibold text-gray-700"
                    >
                      <div className="flex flex-col items-center gap-1">
                        {/* <span>{label}</span> */}
                        <div className={`px-2 py-1 rounded-full text-xs ${color}`}>
                          {key}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Total
                    </div>
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {paginatedVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Belum ada data kunjungan</p>
                        <p className="text-sm">Data akan muncul setelah ada kunjungan yang tercatat</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedVisits.map((visit, index) => (
                    <tr
                      key={visit.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {DateUtils.formatDateOnly(visit.date)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(visit.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                          </span>
                        </div>
                      </td>
                      
                      {VISITOR_FIELDS.map(({ key }) => (
                        <td
                          key={`${visit.id}-${key}`}
                          className="px-4 py-4 text-center"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium text-sm">
                            {visit[key as keyof ProcessedVisit] as number}
                          </span>
                        </td>
                      ))}
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-12 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                            {visit.total}
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2 max-w-[60px]">
                            <div
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((visit.total / Math.max(...paginatedVisits.map(v => v.total))) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    Menampilkan {((page - 1) * perPage) + 1} - {Math.min(page * perPage, sortedVisits.length)} dari {sortedVisits.length} data
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Pertama
                  </button>
                  
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Sebelumnya
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === page;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 text-sm rounded-lg font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`w-10 h-10 text-sm rounded-lg font-medium transition-colors ${
                            page === totalPages
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Selanjutnya
                  </button>
                  
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Terakhir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visitor Categories Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Distribusi Kategori Pengunjung
            </h3>
            
            <div className="space-y-3">
              {VISITOR_FIELDS.map(({ key, label, color }) => {
                const total = processedVisits.reduce((sum, visit) => sum + (visit[key as keyof ProcessedVisit] as number), 0);
                const percentage = processedVisits.length > 0 
                  ? Math.round((total / processedVisits.reduce((sum, visit) => sum + visit.total, 0)) * 100) 
                  : 0;
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`} />
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{total.toLocaleString('id-ID')}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Tren Kunjungan Terbaru
            </h3>
            
            <div className="space-y-4">
              {sortedVisits.slice(0, 5).map((visit) => (
                <div key={visit.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {DateUtils.formatDateOnly(visit.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(visit.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{visit.total} pengunjung</div>
                    <div className="text-xs text-gray-500">
                      Balita: {visit.balita}, Anak: {visit.anak}, Remaja: {visit.remaja}
                    </div>
                  </div>
                </div>
              ))}
              
              {sortedVisits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada data kunjungan terbaru</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(VisitsSection);