"use client";

import React, { memo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { RequestData } from "@/types/types";

interface CalendarProps {
  onDateClick: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = memo(({ onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch visits for the current month
  const fetchVisitsForMonth = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      const response = await fetch(`/api/request?year=${year}&month=${month}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visits');
      }

      const data: RequestData[] = await response.json();
      setVisits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch visits when month changes
  useEffect(() => {
    fetchVisitsForMonth(currentDate);
  }, [currentDate]);

  // Komponen kalender tetap sama seperti sebelumnya
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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

  // Filter visits for a given day
  const getVisitsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return visits.filter((visit) => visit.tanggalPelaksanaan === dateStr);
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  // Check if day is today
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
        <button 
          onClick={() => fetchVisitsForMonth(currentDate)} 
          className="ml-4 underline"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Kalender Kunjungan"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Kalender Permintaan</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth("prev")}
            aria-label="Bulan sebelumnya"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <h4 className="text-lg font-medium text-gray-700 min-w-[140px] text-center select-none">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={() => navigateMonth("next")}
            aria-label="Bulan berikutnya"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </header>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-1 select-none">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-500"
            aria-hidden="true"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const visitsForDay = getVisitsForDate(day);
          const today = isToday(day);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => day && onDateClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)}
              disabled={!day}
              className={`min-h-[80px] p-2 border rounded-md border-gray-100 flex flex-col items-center justify-start text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                day
                  ? "cursor-pointer hover:bg-gray-50"
                  : "bg-gray-50 cursor-default"
              } ${today ? "bg-blue-50 border-blue-300" : ""}`}
              aria-label={day ? `Tanggal ${day}, ${visitsForDay.length} permintaan` : undefined}
            >
              {day && (
                <>
                  <span className={`font-medium mb-1 ${today ? "text-blue-600" : "text-gray-700"}`}>
                    {day}
                  </span>
                  {visitsForDay.length > 0 && (
                    <div className="flex flex-col space-y-1 w-full">
                      {visitsForDay.slice(0, 2).map((visit, i) => (
                        <span
                          key={i}
                          className={`text-xs rounded px-1 py-0.5 text-center text-white ${
                            visit.status === "completed"
                              ? "bg-green-500"
                              : visit.status === "scheduled"
                              ? "bg-blue-500"
                              : visit.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          } truncate`}
                          title={`Instansi: ${visit.namaInstansi}, Peserta: ${visit.jumlahPeserta}`}
                        >
                          {visit.namaInstansi}
                        </span>
                      ))}
                      {visitsForDay.length > 2 && (
                        <span className="text-xs text-gray-500 text-center truncate">
                          +{visitsForDay.length - 2} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default Calendar;
