import React, { useState, useMemo } from 'react';
import { Order, Restaurant } from '../types';
import { formatTaka, toBn, formatDateTime, formatDateShort } from '../utils/numberConverter';
import { exportCSV } from '../utils/storage';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  Eye,
  Award,
} from 'lucide-react';

interface ReportsProps {
  restaurant: Restaurant;
  orders: Order[];
  onOpenReceipt: (order: Order) => void;
}

export const Reports: React.FC<ReportsProps> = ({ restaurant, orders, onOpenReceipt }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchInvoice, setSearchInvoice] = useState('');

  // Selected Month for monthly report
  const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);

  // Filter orders based on reportType & selected date/month
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const orderDate = o.createdAt.split('T')[0];

      if (reportType === 'daily') {
        return orderDate === selectedDate;
      } else {
        return orderDate.startsWith(selectedMonth);
      }
    });
  }, [orders, reportType, selectedDate, selectedMonth]);

  // Further filter by search invoice or customer
  const displayedOrders = useMemo(() => {
    if (!searchInvoice.trim()) return filteredOrders;
    const q = searchInvoice.toLowerCase();
    return filteredOrders.filter(
      (o) =>
        o.invoiceNumber.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.tableName && o.tableName.toLowerCase().includes(q))
    );
  }, [filteredOrders, searchInvoice]);

  // Metrics
  const totalSales = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredOrders]);

  const cashSales = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.paidAmount, 0);
  }, [filteredOrders]);

  const digitalSales = useMemo(() => {
    return filteredOrders
      .filter((o) => ['bkash', 'nagad', 'rocket', 'card'].includes(o.paymentMethod))
      .reduce((sum, o) => sum + o.paidAmount, 0);
  }, [filteredOrders]);

  const totalDueSales = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);
  }, [filteredOrders]);

  const averageOrderValue =
    filteredOrders.length > 0 ? Math.round(totalSales / filteredOrders.length) : 0;

  // Best Selling Dishes
  const topDishes = useMemo(() => {
    const itemMap: Record<string, { name: string; count: number; totalRev: number }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, count: 0, totalRev: 0 };
        }
        itemMap[item.name].count += item.quantity;
        itemMap[item.name].totalRev += item.totalPrice;
      });
    });
    return Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  // Daily Breakdown for Monthly View
  const monthlyDailyData = useMemo(() => {
    if (reportType !== 'monthly') return [];
    const dayMap: Record<string, { date: string; ordersCount: number; sales: number }> = {};
    filteredOrders.forEach((o) => {
      const day = o.createdAt.split('T')[0];
      if (!dayMap[day]) {
        dayMap[day] = { date: day, ordersCount: 0, sales: 0 };
      }
      dayMap[day].ordersCount += 1;
      dayMap[day].sales += o.totalAmount;
    });
    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [reportType, filteredOrders]);

  // Max value for SVG chart scaling
  const maxMonthlySales = useMemo(() => {
    if (!monthlyDailyData.length) return 1;
    return Math.max(...monthlyDailyData.map((d) => d.sales), 100);
  }, [monthlyDailyData]);

  // CSV Export
  const handleExportCSV = () => {
    const rows = filteredOrders.map((o) => ({
      'মেমো নং': o.invoiceNumber,
      'তারিখ ও সময়': formatDateTime(o.createdAt),
      'অর্ডার ধরন': o.orderType,
      টেবিল: o.tableName || '-',
      'কাস্টমার নাম': o.customerName || 'ক্যাশ কাস্টমার',
      'সাবটোটাল (৳)': o.subtotal,
      'ডিসকাউন্ট (৳)': o.discount,
      'ভ্যাট (৳)': o.vat,
      'মোট বিল (৳)': o.totalAmount,
      'পরিশোধিত (৳)': o.paidAmount,
      'বাকি (৳)': o.dueAmount,
      'পরিশোধ মাধ্যম': o.paymentMethod,
    }));
    exportCSV(rows, `restaurant-report-${reportType === 'daily' ? selectedDate : selectedMonth}`);
  };

  // Print Daily Closing Report
  const handlePrintDailyClosing = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            দৈনিক ও মাসিক বিক্রয় রিপোর্ট
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            বিক্রির বিস্তারিত পরিসংখ্যান, নগদ ও অনলাইন আদায় এবং শীর্ষ বিক্রিত খাবার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Daily vs Monthly Tabs */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-md transition ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              দৈনিক রিপোর্ট
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-md transition ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              মাসিক রিপোর্ট
            </button>
          </div>

          {/* Date / Month Picker */}
          {reportType === 'daily' ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold"
            />
          ) : (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold"
            />
          )}

          {/* Actions */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            title="CSV ফাইলে ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            এক্সেল/CSV
          </button>

          <button
            onClick={handlePrintDailyClosing}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            ক্লোজিং রিপোর্ট প্রিন্ট
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
            সর্বমোট বিক্রি (Total Sales)
          </span>
          <p className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {formatTaka(totalSales)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            মোট অর্ডার: <strong className="text-stone-700 dark:text-stone-300">{toBn(filteredOrders.length)}</strong> টি
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            নগদ ক্যাশ আদায়
          </span>
          <p className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatTaka(cashSales)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">ক্যাশ ড্রয়ারে জমা টাকা</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
            বিকাশ / অনলাইন আদায়
          </span>
          <p className="text-xl md:text-2xl font-black text-pink-600 dark:text-pink-400 mt-1 tabular-nums">
            {formatTaka(digitalSales)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">বিকাশ, নগদ, রকেট ও কার্ড</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
            বাকি বিক্রি (Due)
          </span>
          <p className="text-xl md:text-2xl font-black text-red-600 dark:text-red-400 mt-1 tabular-nums">
            {formatTaka(totalDueSales)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            গড় অর্ডার: <strong className="text-stone-700 dark:text-stone-300">{formatTaka(averageOrderValue)}</strong>
          </p>
        </div>
      </div>

      {/* Top Selling Items & Monthly Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top 5 Dishes (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              শীর্ষ ৫টি বিক্রিত খাবার
            </h3>
            {topDishes.length === 0 ? (
              <p className="text-stone-400 text-xs py-8 text-center">কোনো খাবারের তথ্য নেই।</p>
            ) : (
              <div className="space-y-3">
                {topDishes.map((dish, idx) => (
                  <div
                    key={dish.name}
                    className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                        {toBn(idx + 1)}
                      </span>
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">{dish.name}</p>
                        <p className="text-[11px] text-stone-500">
                          বিক্রি: <span className="font-bold">{toBn(dish.count)}</span> টি আইটেম
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                      {formatTaka(dish.totalRev)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Daily / Monthly Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {reportType === 'daily' ? 'দৈনিক বিক্রয় সারসংক্ষেপ' : 'মাসিক প্রতিদিনের বিক্রির গ্রাফ'}
          </h3>

          {reportType === 'monthly' && monthlyDailyData.length > 0 ? (
            <div className="space-y-2">
              <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-1 border-b border-stone-200 dark:border-stone-700 overflow-x-auto">
                {monthlyDailyData.map((d) => {
                  const heightPercent = Math.max(8, Math.round((d.sales / maxMonthlySales) * 100));
                  return (
                    <div
                      key={d.date}
                      className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 bg-stone-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                        {formatDateShort(d.date)}: {formatTaka(d.sales)}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-amber-500 hover:bg-amber-600 rounded-t-sm transition-all"
                      />
                      <span className="text-[9px] text-stone-400 rotate-45 origin-left">
                        {toBn(d.date.slice(-2))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-400 text-right">তারিখ অনুযায়ী মোট বিক্রি</p>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">তারিখ:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {formatDateShort(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">নগদ লেনদেনের সংখ্যা:</span>
                <span className="font-bold tabular-nums">
                  {toBn(filteredOrders.filter((o) => o.paymentMethod === 'cash').length)} টি
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">অনলাইন (বিকাশ/কার্ড):</span>
                <span className="font-bold tabular-nums">
                  {toBn(
                    filteredOrders.filter((o) =>
                      ['bkash', 'nagad', 'card'].includes(o.paymentMethod)
                    ).length
                  )}{' '}
                  টি
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 dark:border-stone-700 pt-2 font-bold text-sm">
                <span>আজকের মোট আয়:</span>
                <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                  {formatTaka(totalSales)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Log Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-sm md:text-base text-stone-900 dark:text-stone-100">
            অর্ডারের তালিকা ({toBn(displayedOrders.length)} টি)
          </h3>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="মেমো নং বা গ্রাহক নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-3">মেমো নং</th>
                <th className="p-3">সময়</th>
                <th className="p-3">ধরন / টেবিল</th>
                <th className="p-3">কাস্টমার</th>
                <th className="p-3">খাবার তালিকা</th>
                <th className="p-3 text-right">সর্বমোট বিল</th>
                <th className="p-3 text-right">পরিশোধ</th>
                <th className="p-3 text-center">মাধ্যম</th>
                <th className="p-3 text-center">মেমো</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400 text-xs">
                    কোনো অর্ডারের তথ্য নেই।
                  </td>
                </tr>
              ) : (
                displayedOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                      {ord.invoiceNumber}
                    </td>
                    <td className="p-3 text-stone-500">{formatDateTime(ord.createdAt)}</td>
                    <td className="p-3">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {ord.orderType === 'dine-in'
                          ? ord.tableName || 'টেবিল'
                          : ord.orderType === 'takeaway'
                          ? 'পার্সেল'
                          : 'ডেলিভারি'}
                      </span>
                    </td>
                    <td className="p-3 text-stone-700 dark:text-stone-300">
                      {ord.customerName || 'ক্যাশ কাস্টমার'}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                      {ord.items.map((i) => `${i.name} (${toBn(i.quantity)})`).join(', ')}
                    </td>
                    <td className="p-3 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {formatTaka(ord.totalAmount)}
                    </td>
                    <td className="p-3 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatTaka(ord.paidAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenReceipt(ord)}
                        className="p-1.5 text-stone-500 hover:text-amber-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="মেমো প্রিন্ট ও প্রিভিউ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Container for Daily Closing Report Sheet */}
      <div className="print-only max-w-xl mx-auto p-6 bg-white text-black text-xs leading-relaxed">
        <div className="text-center pb-3 border-b-2 border-black">
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <p className="text-xs">{restaurant.branch}</p>
          <p className="text-[11px]">{restaurant.address} | ফোন: {restaurant.phone}</p>
          <h2 className="text-sm font-black uppercase mt-2 bg-black text-white py-1">
            দৈনিক বিক্রয় ও হিসাব ক্লোজিং রিপোর্ট (Day-End Report)
          </h2>
          <p className="text-xs mt-1">তারিখ: {formatDateShort(selectedDate)}</p>
        </div>

        <div className="my-4 grid grid-cols-2 gap-4 border p-3">
          <div>
            <p><strong>মোট অর্ডারের সংখ্যা:</strong> {toBn(filteredOrders.length)} টি</p>
            <p><strong>নগদ ক্যাশ আদায়:</strong> {formatTaka(cashSales)}</p>
            <p><strong>অনলাইন / বিকাশ আদায়:</strong> {formatTaka(digitalSales)}</p>
          </div>
          <div>
            <p><strong>বাকি বিক্রি (Due):</strong> {formatTaka(totalDueSales)}</p>
            <p><strong>গড় অর্ডার ভ্যালু:</strong> {formatTaka(averageOrderValue)}</p>
            <p className="text-sm font-bold mt-1"><strong>সর্বমোট বিক্রি:</strong> {formatTaka(totalSales)}</p>
          </div>
        </div>

        <div className="my-4">
          <h3 className="font-bold border-b pb-1 mb-2">খাবার ভিত্তিক বিক্রির হিসাব:</h3>
          <table className="w-full text-left text-xs border">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-1">খাবারের নাম</th>
                <th className="p-1 text-center">পরিমাণ</th>
                <th className="p-1 text-right">মোট টাকা</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish) => (
                <tr key={dish.name} className="border-b">
                  <td className="p-1">{dish.name}</td>
                  <td className="p-1 text-center">{toBn(dish.count)}</td>
                  <td className="p-1 text-right">{formatTaka(dish.totalRev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-between text-xs pt-8 border-t border-dashed border-black">
          <div>
            <p className="border-t border-black pt-1 px-4 text-center">ম্যানেজারের স্বাক্ষর</p>
          </div>
          <div>
            <p className="border-t border-black pt-1 px-4 text-center">মালিকের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  );
};
