import React, { useState } from 'react';
import { Order, Restaurant } from '../types';
import { formatTaka, toBn, formatDateTime } from '../utils/numberConverter';
import { Printer, X, Check, Copy, ChefHat, FileText, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  order: Order;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  isKOT?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  restaurant,
  isOpen,
  onClose,
  isKOT = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewType, setViewType] = useState<'thermal' | 'a4' | 'kot'>(isKOT ? 'kot' : 'thermal');

  if (!isOpen) return null;

  const curr = order.currency || restaurant.currency || 'BDT';

  const handlePrint = () => {
    window.print();
  };

  const copyReceiptText = () => {
    const text = `
*${restaurant.name}*
${restaurant.branch} | ফোন: ${restaurant.phone}
WhatsApp: +88 01817 220921 | Email: ulfathasan44@gmail.com
---------------------------------
ইনভয়েস: ${order.invoiceNumber}
তারিখ: ${formatDateTime(order.createdAt)}
ধরন: ${order.orderType === 'dine-in' ? `টেবিল (${order.tableName || 'টেবিল'})` : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}
কাস্টমার: ${order.customerName || 'সম্মানিত কাস্টমার'} ${order.customerPhone ? `(${order.customerPhone})` : ''}
---------------------------------
${order.items.map((i) => `${i.name} x ${toBn(i.quantity)} = ${formatTaka(i.totalPrice, curr)}`).join('\n')}
---------------------------------
সাবটোটাল: ${formatTaka(order.subtotal, curr)}
ডিসকাউন্ট: ${formatTaka(order.discount, curr)}
ভ্যাট: ${formatTaka(order.vat, curr)}
*মোট বিল: ${formatTaka(order.totalAmount, curr)}*
পরিশোধ: ${formatTaka(order.paidAmount, curr)}
${order.dueAmount > 0 ? `*বাকি: ${formatTaka(order.dueAmount, curr)}*` : `ফেরত: ${formatTaka(order.changeAmount, curr)}`}
পরিশোধ মাধ্যম: ${order.paymentMethod.toUpperCase()}
bKash (Send Money / Pay): 01558452929, 01817220921
---------------------------------
${restaurant.receiptFooter}
`;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Card - hidden during window.print */}
      <div className="no-print bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 card-3d">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('thermal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewType === 'thermal'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              থার্মাল রসিদ (POS)
            </button>
            <button
              onClick={() => setViewType('kot')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                viewType === 'kot'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              কিচেন টোকেন (KOT)
            </button>
            <button
              onClick={() => setViewType('a4')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                viewType === 'a4'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              সাধারণ ভাউচার
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100 dark:bg-stone-950 flex justify-center">
          {viewType === 'kot' ? (
            /* Kitchen Order Token */
            <div className="bg-white text-stone-900 w-[78mm] p-4 shadow-md rounded-sm border border-stone-200 font-mono text-xs">
              <div className="text-center pb-2 border-b-2 border-dashed border-stone-400">
                <span className="bg-stone-900 text-white px-2 py-0.5 text-xs font-bold uppercase rounded">
                  কিচেন অর্ডার টোকেন (KOT)
                </span>
                <h3 className="font-bold text-sm mt-1">{restaurant.name}</h3>
                <p className="text-[11px] text-stone-600">{formatDateTime(order.createdAt)}</p>
              </div>

              <div className="py-2 border-b border-dashed border-stone-300 flex justify-between font-bold text-xs">
                <span>টোকেন: #{order.invoiceNumber.slice(-4)}</span>
                <span className="text-amber-800">
                  {order.orderType === 'dine-in' ? order.tableName || 'টেবিল' : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}
                </span>
              </div>

              <div className="py-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-400">
                      <th className="py-1">আইটেম</th>
                      <th className="py-1 text-right font-bold">পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 font-semibold text-stone-800">{item.name}</td>
                        <td className="py-1.5 text-right font-bold text-base text-stone-900">{toBn(item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {order.notes && (
                <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 mb-2">
                  <strong>বিশেষ নোট:</strong> {order.notes}
                </div>
              )}

              <div className="pt-2 border-t-2 border-dashed border-stone-400 text-center text-[10px] text-stone-500">
                বাবুর্চি কপি · সময়মত সুস্বাদু খাবার তৈরি করুন
              </div>
            </div>
          ) : viewType === 'thermal' ? (
            /* 80mm POS Thermal Slip Preview */
            <div className="bg-white text-stone-900 w-[80mm] p-4 shadow-md rounded-sm border border-stone-200 text-xs leading-relaxed">
              {/* Slip Header */}
              <div className="text-center pb-2 border-b border-dashed border-stone-400">
                <h2 className="font-bold text-base tracking-tight text-stone-950">{restaurant.name}</h2>
                <p className="text-[11px] text-stone-600">{restaurant.branch}</p>
                <p className="text-[10px] text-stone-500">{restaurant.address}</p>
                <p className="text-[11px] font-semibold text-stone-700">মোবাইল: {restaurant.phone}</p>
                <p className="text-[10px] text-stone-600">bKash: ০১৫৫৮৪৫২৯২৯, ০১৮১৭২২০৯২১</p>
                {restaurant.vatBin && (
                  <p className="text-[10px] text-stone-500">ভ্যাট রেজি: {restaurant.vatBin}</p>
                )}
              </div>

              {/* Order Info */}
              <div className="py-2 border-b border-dashed border-stone-300 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">মেমো নং:</span>
                  <span className="font-bold text-stone-900">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">তারিখ ও সময়:</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ধরন:</span>
                  <span className="font-semibold text-amber-800">
                    {order.orderType === 'dine-in' ? `${order.tableName || 'টেবিল বসে'}` : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}
                  </span>
                </div>
                {order.customerName && order.customerName !== 'ক্যাশ কাস্টমার' && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">গ্রাহক:</span>
                    <span className="font-medium">{order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-stone-400 font-semibold">
                      <th className="py-1">খাবার</th>
                      <th className="py-1 text-center">পরিমাণ</th>
                      <th className="py-1 text-right">দর</th>
                      <th className="py-1 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 font-medium">{item.name}</td>
                        <td className="py-1 text-center tabular-nums">{toBn(item.quantity)}</td>
                        <td className="py-1 text-right tabular-nums">{toBn(item.unitPrice)}</td>
                        <td className="py-1 text-right font-semibold tabular-nums">{toBn(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-stone-400 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-600">সাবটোটাল:</span>
                  <span className="font-medium tabular-nums">{formatTaka(order.subtotal, curr)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ডিসকাউন্ট:</span>
                    <span className="font-medium tabular-nums">- {formatTaka(order.discount, curr)}</span>
                  </div>
                )}
                {order.vat > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">ভ্যাট ({toBn(restaurant.vatPercent)}%):</span>
                    <span className="tabular-nums">{formatTaka(order.vat, curr)}</span>
                  </div>
                )}
                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">ডেলিভারি চার্জ:</span>
                    <span className="tabular-nums">{formatTaka(order.deliveryCharge, curr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-b border-stone-800 py-1 my-1">
                  <span>সর্বমোট বিল:</span>
                  <span className="tabular-nums">{formatTaka(order.totalAmount, curr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">পরিশোধিত ({order.paymentMethod.toUpperCase()}):</span>
                  <span className="font-semibold tabular-nums">{formatTaka(order.paidAmount, curr)}</span>
                </div>
                {order.dueAmount > 0 ? (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>বাকি (DUE):</span>
                    <span className="tabular-nums">{formatTaka(order.dueAmount, curr)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-stone-600">
                    <span>ফেরত দেওয়া হয়েছে:</span>
                    <span className="tabular-nums">{formatTaka(order.changeAmount, curr)}</span>
                  </div>
                )}
              </div>

              {/* Scan & Pay QR Code note */}
              {['bkash', 'nagad', 'rocket', 'upi'].includes(order.paymentMethod) && (
                <div className="py-2 border-t border-dashed border-stone-300 text-center">
                  <p className="text-[10px] font-bold text-pink-700">Scan & Pay: 01558452929 / 01817220921</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 mt-2 border-t border-dashed border-stone-400 text-center text-[10px] text-stone-500">
                <p className="italic font-medium text-stone-700">{restaurant.receiptFooter}</p>
                <p className="mt-1">WhatsApp: +88 01817 220921 | Email: ulfathasan44@gmail.com</p>
                <p className="mt-0.5 text-[9px]">Software: Restaurant Calculator (SP TUPRHASAN)</p>
              </div>
            </div>
          ) : (
            /* Full A4 / Regular Voucher Preview */
            <div className="bg-white text-stone-900 w-full max-w-md p-6 shadow-md rounded-lg border border-stone-200 text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="font-bold text-lg text-amber-700">{restaurant.name}</h2>
                  <p className="text-stone-600">{restaurant.branch}</p>
                  <p className="text-stone-500">{restaurant.address}</p>
                  <p className="font-medium text-stone-700">ফোন: {restaurant.phone}</p>
                  <p className="text-[11px] text-stone-500">WhatsApp: +88 01817 220921</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded text-xs">ক্যাশ মেমো</span>
                  <p className="font-bold text-stone-900 mt-1">{order.invoiceNumber}</p>
                  <p className="text-stone-500 text-[11px]">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>

              <div className="my-4 py-2 px-3 bg-stone-50 rounded border flex justify-between items-center text-xs">
                <div>
                  <span className="text-stone-500">অর্ডার ধরন: </span>
                  <span className="font-bold text-stone-800">
                    {order.orderType === 'dine-in' ? order.tableName || 'টেবিল বসে' : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">গ্রাহক: </span>
                  <span className="font-semibold">{order.customerName || 'ক্যাশ কাস্টমার'}</span>
                </div>
              </div>

              <table className="w-full text-left my-4 text-xs">
                <thead className="bg-stone-100 border-y">
                  <tr>
                    <th className="p-2">খাবারের বিবরণ</th>
                    <th className="p-2 text-center">পরিমাণ</th>
                    <th className="p-2 text-right">মূল্য</th>
                    <th className="p-2 text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{i.name}</td>
                      <td className="p-2 text-center tabular-nums">{toBn(i.quantity)}</td>
                      <td className="p-2 text-right tabular-nums">{toBn(i.unitPrice)}</td>
                      <td className="p-2 text-right font-semibold tabular-nums">{toBn(i.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1.5 text-right font-medium text-xs pt-2 border-t">
                <div className="flex justify-between"><span>সাবটোটাল:</span><span>{formatTaka(order.subtotal, curr)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-emerald-700"><span>ডিসকাউন্ট:</span><span>- {formatTaka(order.discount, curr)}</span></div>}
                {order.vat > 0 && <div className="flex justify-between"><span>ভ্যাট:</span><span>{formatTaka(order.vat, curr)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-1 text-stone-950">
                  <span>সর্বমোট বিল:</span><span className="text-amber-700">{formatTaka(order.totalAmount, curr)}</span>
                </div>
                <div className="flex justify-between text-stone-700"><span>পরিশোধ ({order.paymentMethod}):</span><span>{formatTaka(order.paidAmount, curr)}</span></div>
                {order.dueAmount > 0 ? (
                  <div className="flex justify-between text-red-600 font-bold"><span>বাকি (DUE):</span><span>{formatTaka(order.dueAmount, curr)}</span></div>
                ) : (
                  <div className="flex justify-between text-stone-600"><span>ফেরত:</span><span>{formatTaka(order.changeAmount, curr)}</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between gap-3">
          <button
            onClick={copyReceiptText}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'মেমো কপি হয়েছে!' : 'হোয়াটসঅ্যাপ মেমো কপি'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 transition"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন (Print)
            </button>
          </div>
        </div>
      </div>

      {/* Actual Print Element rendered when window.print() is called */}
      <div className="print-only max-w-[80mm] mx-auto p-2 bg-white text-black text-center text-xs leading-tight">
        {viewType === 'kot' ? (
          <div>
            <h2 className="text-sm font-black uppercase">কিচেন টোকেন (KOT)</h2>
            <p className="font-bold text-xs">{restaurant.name}</p>
            <p className="text-[10px]">{formatDateTime(order.createdAt)}</p>
            <div className="border-b-2 border-dashed border-black my-1.5"></div>
            <div className="flex justify-between text-xs font-bold text-left">
              <span>টোকেন #{order.invoiceNumber.slice(-4)}</span>
              <span>{order.orderType === 'dine-in' ? order.tableName || 'টেবিল' : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}</span>
            </div>
            <div className="border-b border-black my-1.5"></div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-1">খাবার</th>
                  <th className="py-1 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1 font-bold">{i.name}</td>
                    <td className="py-1 text-right font-black text-sm">{toBn(i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {order.notes && (
              <p className="mt-2 text-left text-[11px] font-bold">নোট: {order.notes}</p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-bold">{restaurant.name}</h2>
            <p className="text-[10px]">{restaurant.branch}</p>
            <p className="text-[10px]">{restaurant.address}</p>
            <p className="text-[10px] font-semibold">মোবাইল: {restaurant.phone}</p>
            <p className="text-[9px]">bKash: 01558452929, 01817220921</p>
            {restaurant.vatBin && <p className="text-[9px]">ভ্যাট রেজি: {restaurant.vatBin}</p>}
            <div className="border-b border-dashed border-black my-1.5"></div>

            <div className="text-[10px] text-left space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span>মেমো: {order.invoiceNumber}</span>
                <span>{order.orderType === 'dine-in' ? order.tableName || 'টেবিল' : order.orderType === 'takeaway' ? 'পার্সেল' : 'ডেলিভারি'}</span>
              </div>
              <div className="flex justify-between">
                <span>তারিখ: {formatDateTime(order.createdAt)}</span>
              </div>
              {order.customerName && order.customerName !== 'ক্যাশ কাস্টমার' && (
                <div className="flex justify-between">
                  <span>কাস্টমার: {order.customerName}</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-black my-1.5"></div>

            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th>আইটেম</th>
                  <th className="text-center">পরিমাণ</th>
                  <th className="text-right">দর</th>
                  <th className="text-right">মোট</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5">{i.name}</td>
                    <td className="py-0.5 text-center">{toBn(i.quantity)}</td>
                    <td className="py-0.5 text-right">{toBn(i.unitPrice)}</td>
                    <td className="py-0.5 text-right font-semibold">{toBn(i.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-b border-dashed border-black my-1.5"></div>

            <div className="text-[10px] text-right space-y-0.5 font-medium">
              <div className="flex justify-between"><span>সাবটোটাল:</span><span>{formatTaka(order.subtotal, curr)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span>ডিসকাউন্ট:</span><span>- {formatTaka(order.discount, curr)}</span></div>}
              {order.vat > 0 && <div className="flex justify-between"><span>ভ্যাট ({toBn(restaurant.vatPercent)}%):</span><span>{formatTaka(order.vat, curr)}</span></div>}
              <div className="flex justify-between font-bold text-xs border-t border-black pt-1">
                <span>সর্বমোট:</span><span>{formatTaka(order.totalAmount, curr)}</span>
              </div>
              <div className="flex justify-between"><span>পরিশোধ ({order.paymentMethod}):</span><span>{formatTaka(order.paidAmount, curr)}</span></div>
              {order.dueAmount > 0 ? (
                <div className="flex justify-between font-bold"><span>বাকি (DUE):</span><span>{formatTaka(order.dueAmount, curr)}</span></div>
              ) : (
                <div className="flex justify-between"><span>ফেরত:</span><span>{formatTaka(order.changeAmount, curr)}</span></div>
              )}
            </div>

            <div className="border-t border-dashed border-black my-2 pt-1 text-[9px] text-center">
              <p className="italic">{restaurant.receiptFooter}</p>
              <p className="mt-0.5">WhatsApp: +88 01817 220921 | Email: ulfathasan44@gmail.com</p>
              <p className="mt-0.5">Software: Restaurant Calculator</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
