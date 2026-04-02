import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a number as ARS currency
 * Example: 1234.56 → "$1.234,56"
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number without currency symbol
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get month name in Spanish
 */
export function getMonthName(month: number, year?: number): string {
  const date = new Date(year ?? 2024, month - 1, 1);
  const name = format(date, 'MMMM', { locale: es });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Get short month name (e.g., "Ene", "Feb")
 */
export function getShortMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  const name = format(date, 'MMM', { locale: es });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Format a date string to display format
 */
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM yyyy", { locale: es });
}

/**
 * Format date to short format
 */
export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
}

/**
 * Get day name in Spanish
 */
export function getDayName(dateStr: string): string {
  const name = format(parseISO(dateStr), 'EEEE', { locale: es });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get ISO date string for a specific date
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get all days in a month as ISO date strings
 */
export function getMonthDays(year: number, month: number): string[] {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

/**
 * Add months to a date
 */
export function addMonthsToDate(dateStr: string, months: number): string {
  const date = parseISO(dateStr);
  const newDate = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  return toISODate(newDate);
}

/**
 * Get year and month from a date string
 */
export function getYearMonth(dateStr: string): { year: number; month: number } {
  const date = parseISO(dateStr);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

/**
 * Parse an input amount string to a number (handle comma as decimal separator)
 */
export function parseAmount(value: string): number {
  // Replace comma with period and remove any non-numeric chars except period
  const cleaned = value.replace(',', '.').replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
