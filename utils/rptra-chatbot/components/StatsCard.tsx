import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DateUtils } from "@/utils/dateUtils";
import { ProcessedVisit, StatsPeriod } from "@/types/types";

interface StatsCardProps {
  title: "Mingguan" | "Bulanan" | "Tahunan";
  visits: ProcessedVisit[];
  color?: "green" | "purple" | "blue" | "yellow" | "orange";
  showComparison?: boolean;
}

const colorConfig = {
  green: {
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200",
    text: "text-green-600",
    icon: "bg-green-100 text-green-600",
    trend: "text-green-600",
  },
  purple: {
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200",
    text: "text-purple-600",
    icon: "bg-purple-100 text-purple-600",
    trend: "text-purple-600",
  },
  blue: {
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    text: "text-blue-600",
    icon: "bg-blue-100 text-blue-600",
    trend: "text-blue-600",
  },
  yellow: {
    bg: "from-yellow-50 to-amber-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
    icon: "bg-yellow-100 text-yellow-600",
    trend: "text-yellow-600",
  },
  orange: {
    bg: "from-orange-50 to-red-50",
    border: "border-orange-200",
    text: "text-orange-600",
    icon: "bg-orange-100 text-orange-600",
    trend: "text-orange-600",
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  visits, 
  color = "green", 
  showComparison = true 
}) => {
  const stats: StatsPeriod = useMemo(() => {
    const calculatePeriodTotal = (periodVisits: ProcessedVisit[]): number => {
      return periodVisits.reduce((sum, visit) => sum + visit.total, 0);
    };

    const filterVisitsByDateRange = (start: Date, end: Date): ProcessedVisit[] => {
      return visits.filter(visit => {
        const visitDate = new Date(visit.date);
        return DateUtils.isDateInRange(visitDate, start, end);
      });
    };

    let currentPeriodVisits: ProcessedVisit[] = [];
    let previousPeriodVisits: ProcessedVisit[] = [];
    let periodLabel = "";

    switch (title) {
      case "Mingguan": {
        const currentWeek = DateUtils.getCurrentWeekRange();
        const previousWeek = DateUtils.getPreviousWeekRange();
        
        currentPeriodVisits = filterVisitsByDateRange(currentWeek.start, currentWeek.end);
        previousPeriodVisits = filterVisitsByDateRange(previousWeek.start, previousWeek.end);
        
        periodLabel = `${DateUtils.formatDateOnly(currentWeek.start.toISOString())} - ${DateUtils.formatDateOnly(currentWeek.end.toISOString())}`;
        break;
      }
      case "Bulanan": {
        const currentMonth = DateUtils.getCurrentMonthRange();
        const previousMonth = DateUtils.getPreviousMonthRange();
        
        currentPeriodVisits = filterVisitsByDateRange(currentMonth.start, currentMonth.end);
        previousPeriodVisits = filterVisitsByDateRange(previousMonth.start, previousMonth.end);
        
        periodLabel = currentMonth.start.toLocaleDateString('id-ID', { 
          month: 'long', 
          year: 'numeric' 
        });
        break;
      }
      case "Tahunan": {
        const currentYear = DateUtils.getCurrentYearRange();
        const previousYear = DateUtils.getPreviousYearRange();
        
        currentPeriodVisits = filterVisitsByDateRange(currentYear.start, currentYear.end);
        previousPeriodVisits = filterVisitsByDateRange(previousYear.start, previousYear.end);
        
        periodLabel = currentYear.start.getFullYear().toString();
        break;
      }
    }

    const currentTotal = calculatePeriodTotal(currentPeriodVisits);
    const previousTotal = calculatePeriodTotal(previousPeriodVisits);
    
    const change = currentTotal - previousTotal;
    const changePercent = previousTotal > 0 ? Math.round((change / previousTotal) * 100) : 0;

    return {
      label: title,
      value: currentTotal,
      period: periodLabel,
      comparison: showComparison ? {
        previous: previousTotal,
        change,
        changePercent,
      } : undefined,
    };
  }, [visits, title, showComparison]);

  const colors = colorConfig[color];

  const getTrendIcon = () => {
    if (!stats.comparison) return null;
    
    if (stats.comparison.change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (stats.comparison.change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (!stats.comparison) return null;
    
    const { change, changePercent } = stats.comparison;
    
    if (change === 0) {
      return <span className="text-gray-500">Tidak ada perubahan</span>;
    }
    
    const isIncrease = change > 0;
    const textColor = isIncrease ? "text-green-600" : "text-red-600";
    const prefix = isIncrease ? "+" : "";
    
    return (
      <span className={textColor}>
        {prefix}{change} ({prefix}{changePercent}%)
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {stats.label}
          </h3>
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <div className="w-5 h-5 bg-current rounded opacity-60"></div>
          </div>
        </div>

        {/* Main Value */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={`text-3xl font-bold ${colors.text} mb-2`}>
            {stats.value.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            kunjungan
          </div>
        </div>

        {/* Period Info */}
        <div className="text-xs text-gray-600 mb-2 font-medium">
          {stats.period}
        </div>

        {/* Comparison */}
        {stats.comparison && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              {getTrendText()}
            </div>
            <div className="text-gray-500">
              vs periode sebelumnya
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatsCard);