"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import { 
  ChevronDown, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Clock,
  Building
} from "lucide-react";
import { RequestData } from "@/types/types";

// Definisikan tipe untuk Event
interface EventData {
  _id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}

interface CalendarProps {
  onDateClick: (date: string) => void;
}

interface ActivityPopoverProps {
  date: string;
  visits: RequestData[];
  events: EventData[];
  position: { top: number; left: number };
  onClose: () => void;
}

// Komponen Popover terpisah untuk aktivitas
const ActivityPopover: React.FC<ActivityPopoverProps> = memo(({ 
  date, 
  visits, 
  events, 
  position, 
  onClose 
}) => {
  const totalActivities = visits.length + events.length;
  
  // Format date untuk display
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-popover-content]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (totalActivities === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-4 bg-opacity-50"
      role="dialog"
      aria-label={`Detail kegiatan untuk ${formattedDate}`}
      aria-modal="true"
    >
      <div 
        data-popover-content
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in fade-in-90 zoom-in-90"
        style={{
          top: `${Math.min(position.top, window.innerHeight - 400)}px`,
          left: `${Math.min(position.left, window.innerWidth - 400)}px`
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{formattedDate}</h3>
              <p className="text-blue-100 text-sm mt-1">
                {totalActivities} kegiatan terjadwal
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Tutup detail kegiatan"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Kunjungan */}
          {visits.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Kunjungan ({visits.length})
              </h4>
              <div className="space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {visit.namaInstansi}
                      </h5>
                      <span
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
                          ${visit.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : visit.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : visit.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }
                        `}
                      >
                        {visit.status === "completed" ? "Selesai" :
                         visit.status === "scheduled" ? "Terjadwal" :
                         visit.status === "cancelled" ? "Dibatalkan" : "Menunggu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{visit.jumlahPeserta} peserta</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {events.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                Kegiatan Lainnya ({events.length})
              </h4>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <h5 className="font-medium text-gray-900 text-sm mb-2">
                      {event.title}
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
});

ActivityPopover.displayName = "ActivityPopover";

const Calendar: React.FC<CalendarProps> = memo(({ onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState<RequestData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverData, setPopoverData] = useState<{
    date: string;
    visits: RequestData[];
    events: EventData[];
    position: { top: number; left: number };
  } | null>(null);

  // Fungsi fetch gabungan untuk visits dan events
  const fetchCalendarData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const [visitsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/request?year=${year}&month=${month}`),
        fetch('/api/events')
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
  }, []);

  // Effect untuk fetch data saat bulan berubah
  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate, fetchCalendarData]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const dayNamesFull = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Fungsi untuk mendapatkan hari dalam bulan
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, []);

  // Fungsi untuk mendapatkan kunjungan pada tanggal tertentu
  const getDataForDate = useCallback((day: number | null) => {
    if (!day) return { visits: [], events: [] };
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    const visitsForDay = visits.filter((visit) => visit.tanggalPelaksanaan === dateStr);
    const eventsForDay = events.filter((event) => event.date === dateStr);

    return { visits: visitsForDay, events: eventsForDay };
  }, [currentDate, visits, events]);

  // Navigasi bulan
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  }, []);

  // Navigasi ke bulan saat ini
  const goToCurrentMonth = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Handle day click untuk popover
  const handleDayClick = useCallback((day: number, event: React.MouseEvent) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const { visits: visitsForDay, events: eventsForDay } = getDataForDate(day);
    
    const totalActivities = visitsForDay.length + eventsForDay.length;
    
    if (totalActivities > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPopoverData({
        date: dateStr,
        visits: visitsForDay,
        events: eventsForDay,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX
        }
      });
    } else {
      onDateClick(dateStr);
    }
  }, [currentDate, getDataForDate, onDateClick]);

  // Close popover
  const closePopover = useCallback(() => {
    setPopoverData(null);
  }, []);

  const days = getDaysInMonth(currentDate);

  // Cek apakah hari ini
  const isToday = useCallback((day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  // Render loading state
  if (loading) {
    return (
      <section
        aria-label="Kalender Kegiatan"
        className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
            <span className="text-sm sm:text-base text-gray-600 font-medium">Memuat kalender...</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 text-center max-w-xs">
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
        className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3 text-red-600">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base font-medium">Gagal memuat kalender</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 text-center max-w-md">{error}</p>
          <button 
            onClick={() => fetchCalendarData(currentDate)} 
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        aria-label="Kalender Kunjungan dan Kegiatan"
        className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6"
      >
        {/* Header - Mobile First */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          {/* Title Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Kalender Kegiatan</h3>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Jadwal kunjungan dan acara</p>
            </div>
          </div>
          
          {/* Controls Section */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
            {/* Today Button - Hidden on mobile, show on sm */}
            <button
              onClick={goToCurrentMonth}
              aria-label="Ke bulan ini"
              className="hidden sm:block px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="button"
            >
              Hari Ini
            </button>
            
            {/* Month Navigation */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 flex-1 sm:flex-none">
              <button
                onClick={() => navigateMonth("prev")}
                aria-label="Bulan sebelumnya"
                className="p-1.5 sm:p-2 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <h4 
                className="text-sm sm:text-lg font-semibold text-gray-800 min-w-[120px] sm:min-w-[160px] text-center px-2 sm:px-4 py-1"
                aria-live="polite"
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>
              
              <button
                onClick={() => navigateMonth("next")}
                aria-label="Bulan berikutnya"
                className="p-1.5 sm:p-2 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Day Names - Responsive sizing */}
        <div 
          className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 select-none"
          role="row"
          aria-label="Nama hari dalam seminggu"
        >
          {dayNames.map((day, index) => (
            <div
              key={day}
              className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 rounded-md sm:rounded-lg"
              role="columnheader"
              aria-label={dayNamesFull[index]}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Days Grid - Responsive cell sizing */}
        <div 
          className="grid grid-cols-7 gap-1 sm:gap-2"
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
                onClick={(e) => day && handleDayClick(day, e)}
                disabled={!day}
                className={`
                  min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] p-1 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl flex flex-col items-center justify-start text-xs sm:text-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:focus:ring-offset-2
                  ${day
                    ? "cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-sm sm:hover:shadow-md hover:scale-[1.02]"
                    : "bg-transparent cursor-default"
                  }
                  ${today 
                    ? "bg-blue-50 border-blue-300 shadow-sm ring-1 sm:ring-2 ring-blue-200" 
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
                    {/* Date Number */}
                    <span 
                      className={`
                        font-semibold mb-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm
                        ${today 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {day}
                    </span>
                    
                    {/* Activities - Responsive content */}
                    <div className="flex flex-col space-y-1 w-full max-w-full">
                      {/* Mobile activity indicators */}
                      <div className="sm:hidden flex justify-center space-x-1">
                        {visitsForDay.slice(0, 2).map((visit, i) => (
                          <div
                            key={`visit-mobile-${i}`}
                            className={`
                              w-1.5 h-1.5 rounded-full
                              ${visit.status === "completed"
                                ? "bg-green-500"
                                : visit.status === "scheduled"
                                ? "bg-blue-500"
                                : visit.status === "cancelled"
                                ? "bg-red-500"
                                : "bg-gray-500"
                              }
                            `}
                          />
                        ))}
                        {eventsForDay.slice(0, 2).map((event, i) => (
                          <div
                            key={`event-mobile-${i}`}
                            className="w-1.5 h-1.5 rounded-full bg-purple-500"
                          />
                        ))}
                      </div>

                      {/* Desktop activity preview */}
                      <div className="hidden sm:block space-y-1">
                        {visitsForDay.slice(0, 1).map((visit, i) => (
                          <div
                            key={`visit-${i}`}
                            className={`
                              text-xs rounded px-1 sm:px-2 py-0.5 sm:py-1 text-center text-white font-medium truncate
                              shadow-sm
                              ${visit.status === "completed"
                                ? "bg-green-500"
                                : visit.status === "scheduled"
                                ? "bg-blue-500"
                                : visit.status === "cancelled"
                                ? "bg-red-500"
                                : "bg-gray-500"
                              }
                            `}
                          >
                            <span className="hidden md:inline">{visit.namaInstansi}</span>
                            <span className="md:hidden">Kunjungan</span>
                          </div>
                        ))}
                        
                        {eventsForDay.slice(0, 1).map((event, i) => (
                          <div
                            key={`event-${i}`}
                            className="text-xs rounded px-1 sm:px-2 py-0.5 sm:py-1 text-center text-white bg-purple-500 font-medium truncate shadow-sm"
                          >
                            <div className="truncate hidden lg:block">{event.title}</div>
                            <div className="truncate lg:hidden">Kegiatan</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Show count when many activities */}
                      {(totalActivities > 2) && (
                        <div className="text-xs text-gray-500 text-center font-medium bg-gray-100 rounded px-1 py-0.5">
                          <span className="sm:hidden">+{totalActivities}</span>
                          <span className="hidden sm:inline">+{totalActivities - 2} lainnya</span>
                        </div>
                      )}
                    </div>

                    {/* Activity indicator dots for desktop */}
                    {hasActivities && totalActivities <= 2 && (
                      <div className="absolute bottom-1 right-1 hidden sm:flex space-x-1">
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

        {/* Legend - Responsive layout */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Terjadwal</span>
              <span className="text-gray-600 sm:hidden text-xs">TJD</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Selesai</span>
              <span className="text-gray-600 sm:hidden text-xs">SEL</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Kegiatan</span>
              <span className="text-gray-600 sm:hidden text-xs">KGT</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Batal</span>
              <span className="text-gray-600 sm:hidden text-xs">BTL</span>
            </div>
          </div>
        </div>

        {/* Mobile Today Button - Only show on mobile */}
        <div className="sm:hidden mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={goToCurrentMonth}
            aria-label="Ke bulan ini"
            className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
          >
            Lihat Hari Ini
          </button>
        </div>
      </section>

      {/* Popover for activity details */}
      {popoverData && (
        <ActivityPopover
          date={popoverData.date}
          visits={popoverData.visits}
          events={popoverData.events}
          position={popoverData.position}
          onClose={closePopover}
        />
      )}
    </>
  );
});

Calendar.displayName = "Calendar";
export default Calendar;