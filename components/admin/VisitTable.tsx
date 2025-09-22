import React, { useState, useMemo } from "react";
import { FormattedDate } from "@/components/admin/FormattedDate";
import { VisitDataFromAPI } from "@/types/types";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
} from "lucide-react";

const VISITOR_FIELDS = [
  { key: "balita", label: "Balita", description: "0-5 tahun" },
  { key: "anak", label: "Anak", description: "6-12 tahun" },
  { key: "remaja", label: "Remaja", description: "13-17 tahun" },
  { key: "dewasa", label: "Dewasa", description: "18-59 tahun" },
  { key: "lansia", label: "Lansia", description: "60+ tahun" },
] as const;

type VisitTableProps = {
  visits: VisitDataFromAPI[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  openEditModal: (visit: VisitDataFromAPI) => void;
  openDeleteModal: (visit: VisitDataFromAPI) => void;
};

const ITEMS_PER_PAGE = 10;
const VISIBLE_PAGE_BUTTONS = 5;

const VisitTable: React.FC<VisitTableProps> = ({
  visits,
  loading,
  error,
  onRetry,
  openEditModal,
  openDeleteModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const isValidDateRange = useMemo(() => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  }, [startDate, endDate]);

  const filteredVisits = useMemo(() => {
    if (!startDate && !endDate) return visits;
    return visits.filter((visit) => {
      const visitDate = new Date(visit.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && end) return visitDate >= start && visitDate <= end;
      if (start) return visitDate >= start;
      if (end) return visitDate <= end;
      return true;
    });
  }, [visits, startDate, endDate]);

  const totalPages = Math.ceil(filteredVisits.length / ITEMS_PER_PAGE);

  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVisits.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVisits, currentPage]);

  const visiblePages = useMemo(() => {
    const half = Math.floor(VISIBLE_PAGE_BUTTONS / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + VISIBLE_PAGE_BUTTONS - 1);
    if (endPage - startPage + 1 < VISIBLE_PAGE_BUTTONS) {
      startPage = Math.max(1, endPage - VISIBLE_PAGE_BUTTONS + 1);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  // handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
        <span className="ml-4 text-gray-700 font-medium">Loading data...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-5 flex items-center gap-4 shadow-sm">
        <svg
          className="w-6 h-6 text-red-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
        </svg>
        <div className="flex-1">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry
        </button>
      </div>
    );

  if (!loading && !error && visits.length === 0)
    return (
      <div className="text-center py-20">
        <Users className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No visit data available</h3>
        <p className="text-gray-600 mb-8">Start by adding your first visit data</p>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            max={endDate || undefined}
          />
          <span className="mx-2 text-gray-500 font-semibold">to</span>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={startDate || undefined}
          />
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        {!isValidDateRange && (
          <p className="text-red-600 text-sm font-semibold">
            Start date must be before or equal to end date.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-900">Date</th>
              {VISITOR_FIELDS.map(({ key, label, description }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-center font-semibold text-gray-900"
                  title={description}
                >
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedVisits.length === 0 && (
              <tr>
                <td colSpan={VISITOR_FIELDS.length + 3} className="text-center py-8 text-gray-500">
                  No visit data available for the selected date range.
                </td>
              </tr>
            )}
            {paginatedVisits.map((visit) => {
              const total = VISITOR_FIELDS.reduce((sum, { key }) => {
                const val = visit[key as keyof typeof visit];
                return sum + (typeof val === "number" ? val : Number(val) || 0);
              }, 0);

              return (
                <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <FormattedDate dateString={visit.date} />
                  </td>
                  {VISITOR_FIELDS.map(({ key }) => (
                    <td
                      key={`${visit.id}-${key}`}
                      className="px-4 py-4 text-center font-semibold text-gray-800"
                    >
                      {visit[key as keyof typeof visit] || 0}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center font-bold text-blue-600">{total}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(visit)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(visit)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {filteredVisits.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredVisits.length)} of{" "}
              {filteredVisits.length} visits
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2.5rem] px-2 py-2 rounded-md border font-medium focus:outline-none focus:ring-2 ${
                    currentPage === page
                      ? "border-blue-600 bg-blue-600 text-white focus:ring-blue-500"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700 focus:ring-blue-400"
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitTable;
