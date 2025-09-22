export class DateUtils {
  private static readonly JAKARTA_TIMEZONE = 'Asia/Jakarta';
  
  // Get current date in Jakarta timezone
  static getCurrentDate(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: this.JAKARTA_TIMEZONE }));
  }
  
  // Format date to Indonesian locale
  static formatDateOnly(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('id-ID', {
        timeZone: this.JAKARTA_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  }
  
  // Get start and end of current week (Monday to Sunday)
  static getCurrentWeekRange(): { start: Date; end: Date } {
    const now = this.getCurrentDate();
    const currentDay = now.getDay();
    const monday = new Date(now);
    
    // Adjust to Monday (0 = Sunday, 1 = Monday, etc.)
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(now.getDate() - daysToSubtract);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  }
  
  // Get start and end of current month
  static getCurrentMonthRange(): { start: Date; end: Date } {
    const now = this.getCurrentDate();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }
  
  // Get start and end of current year
  static getCurrentYearRange(): { start: Date; end: Date } {
    const now = this.getCurrentDate();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }
  
  // Check if date is within range
  static isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }
  
  // Get previous period ranges for comparison
  static getPreviousWeekRange(): { start: Date; end: Date } {
    const current = this.getCurrentWeekRange();
    const start = new Date(current.start);
    const end = new Date(current.end);
    
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() - 7);
    
    return { start, end };
  }
  
  static getPreviousMonthRange(): { start: Date; end: Date } {
    const now = this.getCurrentDate();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }
  
  static getPreviousYearRange(): { start: Date; end: Date } {
    const now = this.getCurrentDate();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }
}