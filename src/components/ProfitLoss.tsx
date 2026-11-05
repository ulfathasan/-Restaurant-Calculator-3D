import React, { useState, useMemo } from 'react';
import { Order, Expense, ExpenseCategory, Restaurant } from '../types';
import { formatTaka, toBn, formatDateShort } from '../utils/numberConverter';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, Filter, PieChart } from 'lucide-react';

interface ProfitLossProps {
  restaurant: Restaurant;
  orders: Order[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'কাঁচামাল ও মশলা বাজার',
  'দোকান ভাড়া',
  'কর্মচারী বেতন',
  'বিদ্যুৎ ও পানি বিল',
  'গ্যাস ও সিলিন্ডার',
  'পরিবহন ও যাতায়াত',
  'মেরামত ও রক্ষণাবেক্ষণ',
  'অন্যান্য খরচ',
];

export const ProfitLoss: React.FC<ProfitLossProps> = ({
  restaurant,
  orders,
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New expense form
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('কাঁচামাল ও মশলা বাজার');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState('');
  const [formSpentBy, setFormSpentBy] = useState('');

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'cancelled') return false;
      const orderDate = o.createdAt.split('T')[0];
      if (period === 'today') {
        return orderDate === todayStr;
      }
      if (period === 'week') {
        const diffDays =
          (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (period === 'month') {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, period, todayStr, now]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (period === 'today') {
        return e.date === todayStr;
      }
      if (period === 'week') {
        const diffDays =
          (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (period === 'month') {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [expenses, period, todayStr, now]);

  // Calculations
  // Total Revenue
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredOrders]);

  // Food Cost (COGS)
  const totalFoodCost = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const orderFoodCost = o.items.reduce(
        (acc, item) => acc + item.quantity * (item.unitCost || item.unitPrice * 0.55),
        0
      );
      return sum + orderFoodCost;
    }, 0);
  }, [filteredOrders]);

  // Gross Profit
  const grossProfit = Math.max(0, totalRevenue - totalFoodCost);

  // Total Operating Expenses
  const totalOperatingExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Net Profit
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) return;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      restaurantId: restaurant.id,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      date: formDate,
      description: formDesc.trim() || formCategory,
      spentBy: formSpentBy.trim() || 'ম্যানেজার',
    };
    onAddExpense(newExp);
    setFormAmount('');
    setFormDesc('');
    setFormSpentBy('');
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            লাভ-ক্ষতি ও রেস্টুরেন্ট খরচের হিসাব
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            মোট বিক্রি, খাবারের কাঁচামাল খরচ এবং রেস্টুরেন্টের পরিচালন ব্যয় বাদ দিয়ে আসল মুনাফা
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'today'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              আজকের
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'week'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              ৭ দিন
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'month'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              চলতি মাস
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'all'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              সব সময়
            </button>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            নতুন খরচ যোগ করুন
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
            মোট বিক্রয় (বিক্রি)
          </span>
          <p className="text-xl md:text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {formatTaka(totalRevenue)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            মোট {toBn(filteredOrders.length)} টি অর্ডার থেকে
          </p>
        </div>

        {/* Food Cost */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
            খাবারের কাঁচামাল খরচ (COGS)
          </span>
          <p className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            - {formatTaka(totalFoodCost)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">চাল, ডাল, মাছ, মাংস ও মশলা খরচ</p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
            দোকান ও পরিচালন খরচ
          </span>
          <p className="text-xl md:text-2xl font-black text-red-600 dark:text-red-400 mt-1 tabular-nums">
            - {formatTaka(totalOperatingExpenses)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">ভাড়া, গ্যাস, বিদ্যুৎ, বেতন ইত্যাদি</p>
        </div>

        {/* Net Profit */}
        <div
          className={`border rounded-2xl p-4 shadow-xs ${
            netProfit >= 0
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
              : 'bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-800'
          }`}
        >
          <span
            className={`text-[11px] font-bold uppercase tracking-wide ${
              netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
            }`}
          >
            {netProfit >= 0 ? 'নীট আসল লাভ (Net Profit)' : 'নীট লোকসান (Net Loss)'}
          </span>
          <p
            className={`text-xl md:text-2xl font-black mt-1 tabular-nums ${
              netProfit >= 0
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {formatTaka(netProfit)}
          </p>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-300 mt-1">
            লাভের হার: <span className="font-bold">{toBn(netProfitMargin)}%</span>
          </p>
        </div>
      </div>

      {/* Breakdown Visualizer Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-amber-600" />
          লাভ ও খরচের শতকরা ভাগ (Financial Breakdown)
        </h3>

        {totalRevenue > 0 ? (
          <div className="space-y-4">
            {/* Visual Bar */}
            <div className="h-6 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.min(100, (totalFoodCost / totalRevenue) * 100)}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`কাঁচামাল খরচ: ${formatTaka(totalFoodCost)}`}
              />
              <div
                style={{
                  width: `${Math.min(
                    100 - (totalFoodCost / totalRevenue) * 100,
                    (totalOperatingExpenses / totalRevenue) * 100
                  )}%`,
                }}
                className="bg-red-500 h-full transition-all"
                title={`দোকান খরচ: ${formatTaka(totalOperatingExpenses)}`}
              />
              {netProfit > 0 && (
                <div
                  style={{ width: `${Math.min(100, (netProfit / totalRevenue) * 100)}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`আসল নীট লাভ: ${formatTaka(netProfit)}`}
                />
              )}
            </div>

            {/* Legend & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-stone-600 dark:text-stone-300">খাবারের কাঁচামাল খরচ</p>
                  <p className="font-bold text-amber-800 dark:text-amber-300 tabular-nums">
                    {formatTaka(totalFoodCost)} ({toBn(Math.round((totalFoodCost / totalRevenue) * 100))}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                <span className="w-3.5 h-3.5 rounded bg-red-500 shrink-0" />
                <div>
                  <p className="font-medium text-stone-600 dark:text-stone-300">দোকান ও পরিচালন ব্যয়</p>
                  <p className="font-bold text-red-800 dark:text-red-300 tabular-nums">
                    {formatTaka(totalOperatingExpenses)} (
                    {toBn(Math.round((totalOperatingExpenses / totalRevenue) * 100))}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0" />
                <div>
                  <p className="font-medium text-stone-600 dark:text-stone-300">আসল নীট মুনাফা (লাভ)</p>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
                    {formatTaka(netProfit)} ({toBn(netProfitMargin)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-400">
            নির্বাচিত সময়কালে কোনো বিক্রির তথ্য নেই।
          </div>
        )}
      </div>

      {/* Expense History Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <h3 className="font-bold text-sm md:text-base text-stone-900 dark:text-stone-100">
            রেস্টুরেন্ট খরচের খাতা ({toBn(filteredExpenses.length)} টি এন্ট্রি)
          </h3>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 tabular-nums">
            মোট খরচ: {formatTaka(totalOperatingExpenses)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-3">তারিখ</th>
                <th className="p-3">খরচের খাত</th>
                <th className="p-3">বিবরণ</th>
                <th className="p-3">খরচ করেছেন</th>
                <th className="p-3 text-right">পরিমাণ (৳)</th>
                <th className="p-3 text-center">বাদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400 text-xs">
                    কোনো খরচের এন্ট্রি পাওয়া যায়নি। উপরে "নতুন খরচ যোগ করুন" বাটনে ক্লিক করে খরচ যোগ করুন।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-3 font-medium text-stone-700 dark:text-stone-300">
                      {formatDateShort(exp.date)}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">{exp.description}</td>
                    <td className="p-3 text-stone-500">{exp.spentBy || 'ম্যানেজার'}</td>
                    <td className="p-3 text-right font-bold text-red-600 dark:text-red-400 tabular-nums">
                      {formatTaka(exp.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি এই খরচের এন্ট্রিটি মুছে ফেলতে চান?`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-5 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              নতুন খরচ যোগ করুন
            </h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  খরচের খাত নির্বাচন:
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    টাকার পরিমাণ (৳):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="যেমন: ১৫০০"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    তারিখ:
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  খরচের বিস্তারিত বিবরণ:
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="যেমন: ২ বস্তা চাল ও মশলা বাজার"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  কে খরচ করেছেন / গ্রহণকারী:
                </label>
                <input
                  type="text"
                  value={formSpentBy}
                  onChange={(e) => setFormSpentBy(e.target.value)}
                  placeholder="যেমন: ম্যানেজার আকরাম / বাবুর্চি"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
                >
                  খরচ সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
