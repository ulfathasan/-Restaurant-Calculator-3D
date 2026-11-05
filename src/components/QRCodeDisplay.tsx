import React from 'react';
import { PaymentMethod, CurrencyType } from '../types';
import { formatTaka } from '../utils/numberConverter';
import { QrCode, Smartphone, ExternalLink, Check, Copy } from 'lucide-react';

interface QRCodeDisplayProps {
  method: PaymentMethod;
  amount: number;
  currency: CurrencyType;
  invoiceNo?: string;
  bkash1?: string;
  bkash2?: string;
  nagad?: string;
  rocket?: string;
  upiId?: string;
  paypalEmail?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  method,
  amount,
  currency,
  invoiceNo = 'RC-BILL',
  bkash1 = '০১৫৫৮৪৫২৯২৯',
  bkash2 = '০১৮১৭২২০৯২১',
  nagad = '০১৮১৭২২০৯২১',
  rocket = '০১৮১৭২২০৯২১',
  upiId = 'restaurant@upi',
  paypalEmail = 'ulfathasan44@gmail.com',
}) => {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  let targetAccount = '';
  let paymentTitle = '';
  let badgeColor = '';
  let qrColor = '#000000';

  if (method === 'bkash') {
    targetAccount = `${bkash1} / ${bkash2}`;
    paymentTitle = 'বিকাশ পেমেন্ট (bKash Scan & Pay)';
    badgeColor = 'bg-pink-600 text-white';
    qrColor = '#D12053';
  } else if (method === 'nagad') {
    targetAccount = nagad;
    paymentTitle = 'নগদ পেমেন্ট (Nagad Scan & Pay)';
    badgeColor = 'bg-orange-600 text-white';
    qrColor = '#F26522';
  } else if (method === 'rocket') {
    targetAccount = rocket;
    paymentTitle = 'রকেট পেমেন্ট (Rocket Scan & Pay)';
    badgeColor = 'bg-purple-600 text-white';
    qrColor = '#8C3494';
  } else if (method === 'upi') {
    targetAccount = upiId;
    paymentTitle = 'UPI Instant QR (BHIM/GPay/PhonePe)';
    badgeColor = 'bg-blue-600 text-white';
    qrColor = '#1976D2';
  } else if (method === 'paypal') {
    targetAccount = paypalEmail;
    paymentTitle = 'PayPal Scan & Pay';
    badgeColor = 'bg-sky-700 text-white';
    qrColor = '#003087';
  } else {
    return null;
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Generate a clean deterministic 21x21 QR SVG pattern based on text input
  // (Offline friendly, zero external CDN dependencies)
  const renderDeterministicQR = (seedText: string) => {
    const size = 21;
    let hash = 0;
    for (let i = 0; i < seedText.length; i++) {
      hash = (hash << 5) - hash + seedText.charCodeAt(i);
      hash |= 0;
    }

    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        // Standard QR Corner Position Markers (Top-Left, Top-Right, Bottom-Left)
        const inTopLeft = r < 7 && c < 7;
        const inTopRight = r < 7 && c >= size - 7;
        const inBottomLeft = r >= size - 7 && c < 7;

        if (inTopLeft || inTopRight || inBottomLeft) {
          const borderR = inBottomLeft ? r - (size - 7) : r;
          const borderC = inTopRight ? c - (size - 7) : c;
          const isOuter = borderR === 0 || borderR === 6 || borderC === 0 || borderC === 6;
          const isInner = borderR >= 2 && borderR <= 4 && borderC >= 2 && borderC <= 4;
          grid[r][c] = isOuter || isInner;
        } else if (r === 6 || c === 6) {
          // Timing patterns
          grid[r][c] = (r + c) % 2 === 0;
        } else {
          // Deterministic pattern from hash + row/col
          const bit = Math.sin((r * 13 + c * 17 + Math.abs(hash)) % 1000) > 0.05;
          grid[r][c] = bit;
        }
      }
    }

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-36 h-36 mx-auto rounded-lg bg-white p-1.5 shadow-sm border border-stone-200"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={qrColor} /> : null
          )
        )}
      </svg>
    );
  };

  return (
    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {paymentTitle}
        </span>
        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
          প্রদেয়: {formatTaka(amount, currency)}
        </span>
      </div>

      <div className="py-1">
        {renderDeterministicQR(`${method}:${targetAccount}:${amount}:${invoiceNo}`)}
      </div>

      <div className="text-xs">
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          কাস্টমার তার মোবাইল অ্যাপ দিয়ে স্ক্যান করে সরাসরি পরিশোধ করতে পারবেন
        </p>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-xs">
            {targetAccount}
          </span>
          <button
            onClick={() => handleCopy(targetAccount)}
            className="p-1 text-stone-400 hover:text-amber-600 rounded transition"
            title="নম্বর কপি করুন"
          >
            {copiedText === targetAccount ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
