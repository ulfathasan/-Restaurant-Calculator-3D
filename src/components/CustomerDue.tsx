import React, { useState, useMemo } from 'react';
import { Customer, CustomerPayment, Order, PaymentMethod, Restaurant } from '../types';
import { formatTaka, toBn, formatDateShort, formatDateTime } from '../utils/numberConverter';
import {
  Users,
  Search,
  Plus,
  DollarSign,
  Copy,
  Check,
  History,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface CustomerDueProps {
  restaurant: Restaurant;
  customers: Customer[];
  orders: Order[];
  payments: CustomerPayment[];
  onAddCustomer: (customer: Customer) => void;
  onRecordPayment: (payment: CustomerPayment) => void;
}

export const CustomerDue: React.FC<CustomerDueProps> = ({
  restaurant,
  customers,
  orders,
  payments,
  onAddCustomer,
  onRecordPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Collect Payment Modal
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNote, setPayNote] = useState('');

  // Customer Detail Ledger Modal
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // WhatsApp reminder copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Summary Metrics
  const totalDueSum = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  }, [customers]);

  const dueCustomerCount = useMemo(() => {
    return customers.filter((c) => (c.totalDue || 0) > 0).length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDue = filterDueOnly ? (c.totalDue || 0) > 0 : true;
      return matchesSearch && matchesDue;
    });
  }, [customers, searchQuery, filterDueOnly]);

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || !payAmount) return;

    const amt = parseFloat(payAmount) || 0;
    if (amt <= 0) return;

    const newPayment: CustomerPayment = {
      id: `pay-${Date.now()}`,
      customerId: paymentCustomer.id,
      restaurantId: restaurant.id,
      amount: amt,
      method: payMethod,
      date: new Date().toISOString(),
      note: payNote.trim() || 'বাকি পরিশোধ গ্রহণ',
      receiptNumber: `PR-${Date.now().toString().slice(-6)}`,
    };

    onRecordPayment(newPayment);
    setPaymentCustomer(null);
    setPayAmount('');
    setPayNote('');
  };

  // Add Customer Submit
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      restaurantId: restaurant.id,
      name: formName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim(),
      totalSpent: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCust);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setIsAddCustomerOpen(false);
  };

  // Copy WhatsApp Reminder Text
  const copyReminder = (cust: Customer) => {
    const text = `
আসসালামু আলাইকুম ${cust.name} সাহেব,
${restaurant.name} থেকে শুভেচ্ছা।
আপনার বর্তমান বকেয়া/বাকির পরিমাণ: ${formatTaka(cust.totalDue)} টাকা।
সুবিধাজনক সময়ে বকেয়া পরিশোধ করে সহযোগিতার অনুরোধ করা হচ্ছে।
যেকোনো তথ্যের জন্য যোগাযোগ: ${restaurant.phone}
ধন্যবাদ!
`;
    navigator.clipboard.writeText(text.trim());
    setCopiedId(cust.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Customer transactions for ledger
  const customerOrders = useMemo(() => {
    if (!ledgerCustomer) return [];
    return orders.filter(
      (o) => o.customerId === ledgerCustomer.id || (o.customerPhone && o.customerPhone === ledgerCustomer.phone)
    );
  }, [orders, ledgerCustomer]);

  const customerPayments = useMemo(() => {
    if (!ledgerCustomer) return [];
    return payments.filter((p) => p.customerId === ledgerCustomer.id);
  }, [payments, ledgerCustomer]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            বাকি ও কাস্টমার হিসাব (বাকির খাতা)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            নিয়মিত কাস্টমারদের বাকি বিল, পরিশোধের হিস্ট্রি ও খতিয়ান সংরক্ষণ করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          নতুন কাস্টমার যোগ করুন
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
            মোট বকেয়া / বাকি টাকা
          </span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 tabular-nums">
            {formatTaka(totalDueSum)}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">সব কাস্টমারের সম্মিলিত বকেয়া</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
            বাকি থাকা কাস্টমার
          </span>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {toBn(dueCustomerCount)} জন
          </p>
          <p className="text-[11px] text-stone-500 mt-1">যাদের বর্তমানে বকেয়া রয়েছে</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
            মোট রেজিস্টার্ড কাস্টমার
          </span>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {toBn(customers.length)} জন
          </p>
          <p className="text-[11px] text-stone-500 mt-1">খাতায় নাম ও ফোন নম্বর সংরক্ষিত</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterDueOnly(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              !filterDueOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            সব কাস্টমার ({toBn(customers.length)})
          </button>
          <button
            onClick={() => setFilterDueOnly(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterDueOnly
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            বাকি আছে এমন ({toBn(dueCustomerCount)})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-3">কাস্টমার নাম ও মোবাইল</th>
                <th className="p-3">ঠিকানা / পরিচিতি</th>
                <th className="p-3 text-right">মোট কেনাকাটা</th>
                <th className="p-3 text-right">মোট পরিশোধ</th>
                <th className="p-3 text-right">বর্তমান বাকি (বকেয়া)</th>
                <th className="p-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400 text-xs">
                    কোনো কাস্টমার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {c.phone}
                      </p>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      {c.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          {c.address}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">ঠিকানা নেই</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium text-stone-700 dark:text-stone-300 tabular-nums">
                      {formatTaka(c.totalSpent)}
                    </td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatTaka(c.totalPaid)}
                    </td>
                    <td className="p-3 text-right font-black text-sm tabular-nums">
                      {c.totalDue > 0 ? (
                        <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                          {formatTaka(c.totalDue)}
                        </span>
                      ) : (
                        <span className="text-stone-400 font-normal text-xs">পরিশোধিত</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {c.totalDue > 0 && (
                          <>
                            <button
                              onClick={() => {
                                setPaymentCustomer(c);
                                setPayAmount(c.totalDue.toString());
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition"
                            >
                              জমা নিন
                            </button>
                            <button
                              onClick={() => copyReminder(c)}
                              title="হোয়াটসঅ্যাপে তাগাদা মেসেজ কপি"
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-emerald-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                            >
                              {copiedId === c.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setLedgerCustomer(c)}
                          className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <History className="w-3 h-3" />
                          খতিয়ান
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Collect Due Payment */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
              বাকি টাকা জমা নিন
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              গ্রাহক: <strong className="text-stone-800 dark:text-stone-200">{paymentCustomer.name}</strong> ({paymentCustomer.phone})
              <br />
              বর্তমান বকেয়া: <strong className="text-red-600">{formatTaka(paymentCustomer.totalDue)}</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  জমা টাকার পরিমাণ (৳):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentCustomer.totalDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold text-base tabular-nums"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  পরিশোধ মাধ্যম:
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                >
                  <option value="cash">নগদ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="card">ব্যাংক কার্ড (Card)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  মন্তব্য বা নোট (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="যেমন: আংশিক বাকি পরিশোধ"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Customer Ledger / History */}
      {ledgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-2xl w-full p-5 border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {ledgerCustomer.name} - এর ব্যক্তিগত হিসাব খতিয়ান
                </h3>
                <p className="text-xs text-stone-500">
                  মোবাইল: {ledgerCustomer.phone} | ঠিকানা: {ledgerCustomer.address || 'দেওয়া নেই'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500">বর্তমান বকেয়া:</span>
                <p className="text-base font-black text-red-600 tabular-nums">
                  {formatTaka(ledgerCustomer.totalDue)}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Order purchase history */}
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-2">
                  কেনাকাটা ও বিলের তালিকা ({toBn(customerOrders.length)} টি)
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-stone-400 italic">কোনো বিলের তথ্য নেই।</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 dark:bg-stone-800 border-b">
                      <tr>
                        <th className="p-2">মেমো নং</th>
                        <th className="p-2">তারিখ</th>
                        <th className="p-2">খাবার বিবরণ</th>
                        <th className="p-2 text-right">বিল</th>
                        <th className="p-2 text-right">পরিশোধ</th>
                        <th className="p-2 text-right">বাকি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {customerOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="p-2 font-mono font-medium">{o.invoiceNumber}</td>
                          <td className="p-2 text-stone-500">{formatDateShort(o.createdAt)}</td>
                          <td className="p-2 text-stone-600 dark:text-stone-400">
                            {o.items.map((i) => i.name).join(', ')}
                          </td>
                          <td className="p-2 text-right font-medium tabular-nums">{formatTaka(o.totalAmount)}</td>
                          <td className="p-2 text-right text-emerald-600 tabular-nums">{formatTaka(o.paidAmount)}</td>
                          <td className="p-2 text-right font-bold text-red-600 tabular-nums">{formatTaka(o.dueAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Payments history */}
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-2">
                  বাকি পরিশোধের ইতিহাস ({toBn(customerPayments.length)} টি)
                </h4>
                {customerPayments.length === 0 ? (
                  <p className="text-stone-400 italic">এখনো কোনো আলাদা বাকি জমা নেওয়া হয়নি।</p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 dark:bg-stone-800 border-b">
                      <tr>
                        <th className="p-2">রসিদ নং</th>
                        <th className="p-2">তারিখ</th>
                        <th className="p-2">মাধ্যম</th>
                        <th className="p-2">নোট</th>
                        <th className="p-2 text-right">জমা পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {customerPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2 font-mono">{p.receiptNumber}</td>
                          <td className="p-2 text-stone-500">{formatDateTime(p.date)}</td>
                          <td className="p-2 font-semibold text-stone-700 dark:text-stone-300">
                            {p.method.toUpperCase()}
                          </td>
                          <td className="p-2 text-stone-500">{p.note || '-'}</td>
                          <td className="p-2 text-right font-bold text-emerald-600 tabular-nums">
                            +{formatTaka(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setLedgerCustomer(null)}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 rounded-lg text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
              নতুন কাস্টমার যোগ করুন
            </h3>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  কাস্টমারের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: মো. কামরুল হাসান"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="০১৭০০-০০০০০০"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  অফিস বা বাসার ঠিকানা:
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="যেমন: মতিঝিল সোনালী ব্যাংক ভবনের বিপরীত"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
