/**
 * Utility functions for Bengali numbers, currency formatting, multi-currency, and dates
 */

import { CurrencyType } from '../types';

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBn(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  BDT: '৳',
  INR: '₹',
  USD: '$',
};

export function formatTaka(
  amount: number | undefined | null,
  currency: CurrencyType | string = 'BDT',
  useBn: boolean = true
): string {
  const val = Number(amount || 0);
  const symbol =
    currency === 'USD'
      ? '$'
      : currency === 'INR'
      ? '₹'
      : currency === 'BDT' || currency === '৳'
      ? '৳'
      : (currency as string);

  const formatted = val.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return useBn ? `${symbol} ${toBn(formatted)}` : `${symbol} ${formatted}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'বিকাল/রাত' : 'সকাল';
  hours = hours % 12 || 12;

  return `${toBn(day)}/${toBn(month)}/${toBn(year)} (${toBn(hours)}:${toBn(minutes)} ${ampm})`;
}

export function formatDateShort(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${toBn(day)}/${toBn(month)}/${toBn(year)}`;
}

export function generateInvoiceNumber(existingCount: number = 0): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const seq = (existingCount + 1).toString().padStart(4, '0');
  return `RC-${y}${m}${d}-${seq}`;
}
