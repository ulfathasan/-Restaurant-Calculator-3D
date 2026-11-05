import React, { useState } from 'react';
import { RestaurantTable, Order } from '../types';
import { formatTaka, toBn, formatDateTime } from '../utils/numberConverter';
import { Utensils, Plus, CheckCircle2, Clock, ArrowRight, Printer, AlertCircle } from 'lucide-react';

interface TableManagementProps {
  tables: RestaurantTable[];
  orders: Order[];
  onSelectTableForBilling: (tableId: string) => void;
  onClearTable: (tableId: string) => void;
  onAddTable: (newTable: RestaurantTable) => void;
  onOpenReceipt: (order: Order) => void;
}

export const TableManagement: React.FC<TableManagementProps> = ({
  tables,
  orders,
  onSelectTableForBilling,
  onClearTable,
  onAddTable,
  onOpenReceipt,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  const runningOrders = orders.filter((o) => o.status === 'running' && o.tableId);

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const newTable: RestaurantTable = {
      id: `t-${Date.now()}`,
      name: newTableName.trim(),
      capacity: parseInt(newTableCapacity, 10) || 4,
      status: 'available',
    };
    onAddTable(newTable);
    setNewTableName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            টেবিল ও লাইভ অর্ডার ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            মোট টেবিল: {toBn(tables.length)} টি | খালি:{' '}
            {toBn(tables.filter((t) => t.status === 'available').length)} টি | রানিং অর্ডার:{' '}
            {toBn(tables.filter((t) => t.status === 'occupied').length)} টি
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          নতুন টেবিল যোগ করুন
        </button>
      </div>

      {/* Tables Floor Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const currentOrder = orders.find(
            (o) => o.id === table.currentOrderId || (o.tableId === table.id && o.status === 'running')
          );
          const isOccupied = table.status === 'occupied' || !!currentOrder;
          const isBilled = table.status === 'billed';

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 shadow-xs ${
                isOccupied
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/10'
                  : isBilled
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              <div>
                {/* Table Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                    {table.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOccupied
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                        : isBilled
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {isOccupied ? 'রানিং অর্ডার' : isBilled ? 'বিল প্রস্তুত' : 'খালি (ফ্রি)'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 mb-3">
                  ক্যাপাসিটি: {toBn(table.capacity)} জন
                </p>

                {/* If active order */}
                {currentOrder ? (
                  <div className="bg-white/80 dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 mb-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                      <span>অর্ডার নং:</span>
                      <span className="font-mono font-medium">{currentOrder.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                      <span>আইটেম সংখ্যা:</span>
                      <span className="font-bold">{toBn(currentOrder.items.length)} টি খাবার</span>
                    </div>
                    <div className="flex justify-between text-stone-900 dark:text-white font-bold text-xs pt-1 border-t border-stone-200 dark:border-stone-700">
                      <span>চলতি বিল:</span>
                      <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                        {formatTaka(currentOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-stone-400">
                    কোনো অর্ডার রানিং নেই
                  </div>
                )}
              </div>

              {/* Table Action Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center gap-1.5">
                {isOccupied && currentOrder ? (
                  <>
                    <button
                      onClick={() => onSelectTableForBilling(table.id)}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>বিল সম্পন্ন / আইটেম যোগ</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenReceipt(currentOrder)}
                      title="মেমো প্রিন্ট"
                      className="p-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onSelectTableForBilling(table.id)}
                    className="w-full py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন অর্ডার শুরু করুন</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Running Orders Summary Table */}
      {runningOrders.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            চলমান রানিং অর্ডারসমূহ ({toBn(runningOrders.length)} টি)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-2.5">মেমো নং</th>
                  <th className="p-2.5">টেবিল</th>
                  <th className="p-2.5">সময়</th>
                  <th className="p-2.5">খাবারের আইটেম</th>
                  <th className="p-2.5 text-right">বিল পরিমাণ</th>
                  <th className="p-2.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {runningOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-2.5 font-mono font-medium text-amber-700 dark:text-amber-400">
                      {ord.invoiceNumber}
                    </td>
                    <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100">
                      {ord.tableName}
                    </td>
                    <td className="p-2.5 text-stone-500">{formatDateTime(ord.createdAt)}</td>
                    <td className="p-2.5 text-stone-700 dark:text-stone-300">
                      {ord.items.map((i) => `${i.name} (${toBn(i.quantity)})`).join(', ')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {formatTaka(ord.totalAmount)}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => ord.tableId && onSelectTableForBilling(ord.tableId)}
                          className="px-2.5 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition"
                        >
                          বিল ক্লোজ
                        </button>
                        <button
                          onClick={() => onOpenReceipt(ord)}
                          className="p-1 text-stone-500 hover:text-stone-800 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
              নতুন টেবিল যোগ করুন
            </h3>
            <form onSubmit={handleAddTableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  টেবিলের নাম / নম্বর:
                </label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="যেমন: টেবিল ০৯ অথবা কেবিন ৩"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  সিট সংখ্যা (ক্যাপাসিটি):
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  টেবিল তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
