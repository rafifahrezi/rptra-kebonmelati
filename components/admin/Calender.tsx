"use client";

import React, { memo, useState, useEffect, useMemo } from "react";
import { ChevronDown, Calendar as CalendarIcon, RefreshCw, AlertCircle } from "lucide-react";
import { RequestData } from "@/types/types";

// Definisikan tipe untuk Event
interface EventData {
  _id: string;
  title: string;
  date: string;
  time: string;
  // Tambahkan field lain sesuai kebutuhan
}

interface CalendarProps {
  onDateClick: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = memo(({ onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<RequestData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch gabungan untuk visits dan events
  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Concurrent fetching untuk meningkatkan performa
      const [visitsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/request?year=${year}&month=${month}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/events', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      ]);

      if (!visitsResponse.ok || !eventsResponse.ok) {
        throw new Error('Gagal mengambil data kalender');
      }

      const visitsData: RequestData[] = await visitsResponse.json();
      const eventsData: EventData[] = await eventsResponse.json();

      setVisits(visitsData);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui');
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk fetch data saat bulan berubah
  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate]);

  // Komponen kalender tetap sama seperti sebelumnya
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Fungsi untuk mendapatkan hari dalam bulan
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Padding nulls for days before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Fungsi untuk mendapatkan kunjungan pada tanggal tertentu
  const getDataForDate = (day: number | null) => {
    if (!day) return { visits: [], events: [] };
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    const visitsForDay = visits.filter((visit) => visit.tanggalPelaksanaan === dateStr);
    const eventsForDay = events.filter((event) => event.date === dateStr);

    return { visits: visitsForDay, events: eventsForDay };
  };

  // Navigasi bulan
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  // Navigasi ke bulan saat ini
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);

  // Cek apakah hari ini
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Render loading state
  if (loading) {
    return (
      <section
        aria-label="Kalender Kegiatan"
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-600 font-medium">Memuat kalender...</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Sedang mengambil data kunjungan dan kegiatan
          </p>
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section
        aria-label="Kalender Kegiatan"
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">Gagal memuat kalender</span>
          </div>
          <p className="text-gray-600 text-center max-w-md">{error}</p>
          <button 
            onClick={() => fetchCalendarData(currentDate)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Kalender Kunjungan dan Kegiatan"
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Kalender Kegiatan</h3>
            <p className="text-sm text-gray-600">Jadwal kunjungan dan acara</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={goToCurrentMonth}
            aria-label="Ke bulan ini"
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            type="button"
          >
            Hari Ini
          </button>
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => navigateMonth("prev")}
              aria-label="Bulan sebelumnya"
              className="p-2 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
            >
              <ChevronDown className="w-4 h-4 rotate-90 text-gray-600" />
            </button>
            
            <h4 
              className="text-lg font-semibold text-gray-800 min-w-[160px] text-center px-4 py-1"
              aria-live="polite"
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            
            <button
              onClick={() => navigateMonth("next")}
              aria-label="Bulan berikutnya"
              className="p-2 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
            >
              <ChevronDown className="w-4 h-4 -rotate-90 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Day Names */}
      <div 
        className="grid grid-cols-7 gap-2 mb-3 select-none"
        role="row"
        aria-label="Nama hari dalam seminggu"
      >
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div 
  className="grid grid-cols-7 gap-2"
  role="grid"
  aria-label={`Hari dalam bulan ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
>
  {days.map((day, idx) => {
    const { visits: visitsForDay, events: eventsForDay } = getDataForDate(day);
    const today = isToday(day);
    const totalActivities = visitsForDay.length + eventsForDay.length;
    const hasActivities = totalActivities > 0;

    return (
      <button
        key={idx}
        type="button"
        onClick={() => day && onDateClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)}
        disabled={!day}
        className={`
          min-h-[100px] p-3 rounded-xl flex flex-col items-center justify-start text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${day
            ? "cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]"
            : "bg-transparent cursor-default"
          }
          ${today 
            ? "bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-200" 
            : "bg-white"
          }
          ${hasActivities ? "ring-1 ring-gray-100" : ""}
        `}
        aria-label={
          day 
            ? `Tanggal ${day} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}, ${totalActivities} kegiatan` 
            : undefined
        }
        aria-disabled={!day}
        role="gridcell"
      >
        {day && (
          <>
            <span 
              className={`
                font-semibold mb-2 px-2 py-1 rounded-full text-sm
                ${today 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {day}
            </span>
            
            <div className="flex flex-col space-y-1.5 w-full max-w-full">
              {/* Tampilkan kunjungan */}
              {visitsForDay.slice(0, 2).map((visit, i) => (
                <div
                  key={`visit-${i}`}
                  className={`
                    text-xs rounded-lg px-2 py-1 text-center text-white font-medium truncate
                    shadow-sm transition-colors
                    ${visit.status === "completed"
                      ? "bg-green-500 hover:bg-green-600"
                      : visit.status === "scheduled"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : visit.status === "cancelled"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-500 hover:bg-gray-600"
                    }
                  `}
                  title={`Kunjungan: ${visit.namaInstansi}, Peserta: ${visit.jumlahPeserta}, Status: ${visit.status}`}
                >
                  {visit.namaInstansi}
                </div>
              ))}
              
              {/* Tampilkan events dengan waktu */}
              {eventsForDay.slice(0, 2).map((event, i) => (
                <div
                  key={`event-${i}`}
                  className="text-xs rounded-lg px-2 py-1 text-center text-white bg-purple-500 hover:bg-purple-600 font-medium truncate shadow-sm transition-colors"
                  title={`Kegiatan: ${event.title}, Waktu: ${event.time}`}
                >
                  <div className="truncate">{event.title}</div>
                  <div className="text-[10px] opacity-80">{event.time}</div>
                </div>
              ))}
              
              {/* Tampilkan jumlah tambahan jika ada */}
              {(totalActivities > 2) && (
                <div className="text-xs text-gray-500 text-center font-medium bg-gray-100 rounded-lg px-2 py-1">
                  +{totalActivities - 2} kegiatan lainnya
                </div>
              )}
            </div>

            {/* Activity indicator dot untuk hari dengan kegiatan */}
            {hasActivities && totalActivities <= 2 && (
              <div className="absolute bottom-1 right-1 flex space-x-1">
                {visitsForDay.length > 0 && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
                {eventsForDay.length > 0 && (
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                )}
              </div>
            )}
          </>
        )}
      </button>
    );
  })}
</div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Kunjungan Terjadwal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Kunjungan Selesai</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-600">Kegiatan Lainnya</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Dibatalkan</span>
          </div>
        </div>
      </div>
    </section>
  );
});

Calendar.displayName = "Calendar";
export default Calendar;