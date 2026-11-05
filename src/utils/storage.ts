import { AppState } from '../types';
import {
  initialRestaurants,
  initialMenuItems,
  initialTables,
  initialCustomers,
  initialOrders,
  initialExpenses,
  initialAffiliateConfig,
} from '../data/initialData';

const STORAGE_KEY = 'restaurant_calculator_v2';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.restaurants && parsed.restaurants.length > 0 && parsed.menuItems?.length >= 80) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load local storage state:', err);
  }

  return {
    restaurants: initialRestaurants,
    currentRestaurantId: initialRestaurants[0].id,
    menuItems: initialMenuItems,
    tables: initialTables,
    orders: initialOrders,
    customers: initialCustomers,
    customerPayments: [],
    expenses: initialExpenses,
    activeView: 'pos',
    currency: 'BDT',
    affiliateConfig: initialAffiliateConfig,
  };
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportBackupJSON(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const d = new Date().toISOString().split('T')[0];
  a.download = `restaurant-calculator-backup-${d}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(data: any[], filename: string): void {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = obj[header] === undefined || obj[header] === null ? '' : obj[header];
        const stringified = String(val).replace(/"/g, '""');
        return `"${stringified}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates a completely standalone single-file HTML version (restaurant-calculator.html)
 * ready for public_html or double-clicking offline.
 */
export function generateStandaloneHTML(state: AppState): void {
  const serializedState = JSON.stringify(state).replace(/</g, '\\u003c');
  const currentRest = state.restaurants.find((r) => r.id === state.currentRestaurantId) || state.restaurants[0];

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentRest.name} - Restaurant Calculator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --primary-color: #d97706;
      --background-color: #f8fafc;
      --card-bg: #ffffff;
      --text-color: #0f172a;
    }
    body.dark-theme, .dark {
      --primary-color: #4dabf7;
      --primary-color-hover: #1e88e5;
      --secondary-color: #adb5bd;
      --background-color: #121212;
      --text-color: #e9ecef;
      --card-bg: #1e1e1e;
      --card-shadow: 0 4px 8px rgba(0,0,0,0.4);
      --border-color: #495057;
      --header-bg: #1e1e1e;
      background-color: #121212 !important;
      color: #e9ecef !important;
    }
    body { font-family: 'Hind Siliguri', system-ui, sans-serif; }
    .card-3d {
      box-shadow: 0 8px 16px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
      transition: all 0.2s ease;
    }
    .card-3d:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -6px rgba(0,0,0,0.12);
    }
    @media print {
      body { background: #fff !important; color: #000 !important; font-size: 12px !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
    @media screen {
      .print-only { display: none !important; }
    }
  </style>
</head>
<body class="bg-stone-100 text-stone-900 min-h-screen">
  <div id="standalone-app" class="no-print">
    <!-- Header -->
    <header class="bg-amber-600 text-white px-4 sm:px-6 py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span>🍽️</span> ${currentRest.name}
        </h1>
        <p class="text-xs text-amber-100">
          ${currentRest.branch} | ফোন: ${currentRest.phone} | bKash: 01558452929, 01817220921
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="document.body.classList.toggle('dark-theme')" class="bg-white/20 hover:bg-white/30 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold">🌓 থিম</button>
        <a href="https://affiliatemarketingwebsp.blogspot.com" target="_blank" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold">🛍️ অ্যাফিলিয়েট শপ</a>
        <button onclick="window.print()" class="bg-white text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow">🖨️ প্রিন্ট</button>
      </div>
    </header>

    <!-- Support Strip -->
    <div class="bg-amber-100/80 text-amber-900 px-4 py-1.5 text-[11px] flex flex-wrap justify-between items-center border-b border-amber-200">
      <span>WhatsApp: +88 01817 220921 | Email: ulfathasan44@gmail.com</span>
      <span class="font-bold">১০০% অফলাইন ফাইল (public_html রেডি) | Admin: SP TUPRHASAN</span>
    </div>

    <main class="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Menu items -->
      <section class="lg:col-span-7 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 card-3d">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 class="font-bold text-base text-stone-800">খাবারের মেনু (মোট ১১২+ আইটেম)</h2>
          <div class="flex items-center gap-2">
            <input type="text" id="searchInput" oninput="filterMenuItems()" placeholder="খাবার খুঁজুন..." class="border border-stone-300 rounded-lg px-3 py-1.5 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <select id="categorySelect" onchange="filterMenuItems()" class="border border-stone-300 rounded-lg px-2 py-1.5 text-xs bg-stone-50">
              <option value="all">সব ক্যাটাগরি</option>
              <option value="মেজবান স্পেশাল">মেজবান স্পেশাল</option>
              <option value="মাছ">মাছ</option>
              <option value="মাংস">মাংস</option>
              <option value="ভর্তা ও ভাজি">ভর্তা ও ভাজি</option>
              <option value="ডাল ও সবজি">ডাল ও সবজি</option>
              <option value="ভাত ও খিচুড়ি">ভাত ও খিচুড়ি</option>
              <option value="বিরিয়ানি ও তেহারি">বিরিয়ানি ও তেহারি</option>
              <option value="নাস্তা ও স্ন্যাক্স">নাস্তা ও স্ন্যাক্স</option>
              <option value="মিষ্টি ও ডেজার্ট">মিষ্টি ও ডেজার্ট</option>
              <option value="চা ও ড্রিংকস">চা ও ড্রিংকস</option>
            </select>
          </div>
        </div>
        <div id="menuContainer" class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
          <!-- Dynamically populated -->
        </div>
      </section>

      <!-- Right: POS Cart -->
      <section class="lg:col-span-5 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 card-3d flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b pb-3 mb-3">
            <h2 class="font-bold text-base text-stone-800">ক্যাশ মেমো / বিলিং</h2>
            <button onclick="clearCart()" class="text-red-500 hover:text-red-700 text-xs font-semibold">নতুন বিল</button>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label class="text-[11px] font-medium text-stone-600">অর্ডারের ধরন:</label>
              <select id="orderType" class="w-full text-xs border rounded-lg p-2 bg-stone-50">
                <option value="dine-in">টেবিল (ডাইন-ইন)</option>
                <option value="takeaway">পার্সেল (নিয়ে যাওয়া)</option>
                <option value="delivery">হোম ডেলিভারি</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-medium text-stone-600">টেবিল / গ্রাহক:</label>
              <input type="text" id="tableNo" value="টেবিল ০১" class="w-full text-xs border rounded-lg p-2 bg-stone-50 font-bold">
            </div>
          </div>

          <!-- Cart items list -->
          <div class="border rounded-xl overflow-hidden mb-3">
            <table class="w-full text-left text-xs">
              <thead class="bg-stone-100 text-stone-700 font-semibold border-b">
                <tr>
                  <th class="p-2">খাবার</th>
                  <th class="p-2 text-center">পরিমাণ</th>
                  <th class="p-2 text-right">মূল্য</th>
                  <th class="p-2 text-center">বাদ</th>
                </tr>
              </thead>
              <tbody id="cartTableBody" class="divide-y divide-stone-100">
                <!-- Cart rows -->
              </tbody>
            </table>
            <div id="emptyCartNotice" class="p-6 text-center text-stone-400 text-xs">
              এখনো কোনো খাবার নির্বাচন করা হয়নি। বাঁ দিকের মেনু থেকে খাবার সিলেক্ট করুন।
            </div>
          </div>

          <!-- Discount & calculations -->
          <div class="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border mb-3">
            <div class="flex justify-between">
              <span>সাবটোটাল:</span>
              <span id="subtotalText" class="font-bold text-stone-800">৳ ০</span>
            </div>
            <div class="flex justify-between items-center">
              <span>ডিসকাউন্ট (৳):</span>
              <input type="number" id="discountInput" value="0" min="0" oninput="renderCartSummary()" class="w-20 text-right border rounded px-1.5 py-0.5 text-xs font-bold">
            </div>
            <div class="flex justify-between items-center">
              <span>ভ্যাট (৫%):</span>
              <span id="vatText" class="font-bold text-stone-800">৳ ০</span>
            </div>
            <div class="flex justify-between pt-2 border-t font-black text-base text-stone-900">
              <span>মোট প্রদেয়:</span>
              <span id="totalText" class="text-amber-600">৳ ০</span>
            </div>
          </div>

          <!-- Payment -->
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label class="text-[11px] font-medium text-stone-600">পরিশোধ মাধ্যম:</label>
              <select id="paymentMethod" onchange="checkQRVisibility()" class="w-full text-xs border rounded-lg p-2 font-bold">
                <option value="cash">নগদ (Cash)</option>
                <option value="bkash">বিকাশ (০১৫৫৮৪৫২৯২৯)</option>
                <option value="nagad">নগদ (০১৮১৭২২০৯২১)</option>
                <option value="rocket">রকেট (Rocket)</option>
                <option value="cod">COD</option>
                <option value="due">বাকি (Due)</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-medium text-stone-600">কাস্টমার দিল (৳):</label>
              <input type="number" id="paidInput" value="0" min="0" oninput="calculateChange()" class="w-full text-xs border rounded-lg p-2 font-bold">
            </div>
          </div>

          <div id="qrNotice" class="hidden p-2 bg-pink-50 text-pink-900 border border-pink-200 rounded-lg text-center text-xs mb-2">
            <strong>Scan & Pay:</strong> 01558452929 / 01817220921 (বিকাশ ও নগদ পার্সোনাল)
          </div>

          <div class="flex justify-between text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl mb-4 font-bold">
            <span>ফেরত দিতে হবে:</span>
            <span id="changeText">৳ ০</span>
          </div>
        </div>

        <button onclick="printBill()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm">
          <span>🖨️</span> বিল ও মেমো প্রিন্ট করুন
        </button>
      </section>
    </main>
  </div>

  <!-- Print Slip Container -->
  <div id="printSlip" class="print-only max-w-[80mm] mx-auto p-2 bg-white text-black text-center text-xs leading-tight">
    <h2 class="text-sm font-bold">${currentRest.name}</h2>
    <p class="text-[10px]">${currentRest.branch}</p>
    <p class="text-[10px]">${currentRest.address}</p>
    <p class="text-[10px] font-semibold">মোবাইল: ${currentRest.phone}</p>
    <p class="text-[9px]">bKash: 01558452929, 01817220921</p>
    <div class="border-b border-dashed border-black my-2"></div>
    <div class="flex justify-between text-[11px] text-left">
      <span id="slipInvoiceNo">ইনভয়েস: RC-001</span>
      <span id="slipDateTime"></span>
    </div>
    <div class="flex justify-between text-[11px] text-left">
      <span id="slipOrderType">ডাইন-ইন</span>
      <span id="slipTableNo">টেবিল ০১</span>
    </div>
    <div class="border-b border-dashed border-black my-2"></div>
    <table class="w-full text-[11px] text-left">
      <thead>
        <tr class="border-b border-black">
          <th>খাবার</th>
          <th class="text-center">পরিমাণ</th>
          <th class="text-right">টাকা</th>
        </tr>
      </thead>
      <tbody id="slipItems"></tbody>
    </table>
    <div class="border-b border-dashed border-black my-2"></div>
    <div class="space-y-1 text-[11px] text-right font-medium">
      <div class="flex justify-between"><span>সাবটোটাল:</span><span id="slipSubtotal">৳ ০</span></div>
      <div class="flex justify-between"><span>ডিসকাউন্ট:</span><span id="slipDiscount">৳ ০</span></div>
      <div class="flex justify-between"><span>ভ্যাট (৫%):</span><span id="slipVat">৳ ০</span></div>
      <div class="flex justify-between font-bold text-sm border-t border-black pt-1"><span>মোট বিল:</span><span id="slipTotal">৳ ০</span></div>
      <div class="flex justify-between"><span>পরিশোধ:</span><span id="slipPaid">৳ ০</span></div>
      <div class="flex justify-between"><span>ফেরত / বাকি:</span><span id="slipChange">৳ ০</span></div>
    </div>
    <div class="border-b border-dashed border-black my-2"></div>
    <p class="text-[10px] mt-2 italic">${currentRest.receiptFooter}</p>
    <p class="text-[9px] mt-1 text-gray-500">WhatsApp: +88 01817 220921 | Email: ulfathasan44@gmail.com</p>
    <p class="text-[8px] text-gray-400">Software: Restaurant Calculator (SP TUPRHASAN)</p>
  </div>

  <script>
    const INITIAL_DATA = ${serializedState};
    let menuItems = INITIAL_DATA.menuItems || [];
    let cart = [];

    function renderMenu(items) {
      const container = document.getElementById('menuContainer');
      container.innerHTML = '';
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'border border-stone-200 rounded-xl p-2.5 hover:border-amber-500 cursor-pointer transition bg-stone-50 flex flex-col justify-between card-3d';
        div.onclick = () => addToCart(item);
        div.innerHTML = \`
          <div>
            <span class="text-[10px] text-amber-700 font-semibold">\${item.category}</span>
            <h4 class="font-bold text-xs text-stone-800 leading-tight">\${item.name}</h4>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-amber-600 font-bold text-xs">৳ \${item.sellingPrice}</span>
            <span class="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">+ যোগ</span>
          </div>
        \`;
        container.appendChild(div);
      });
    }

    function checkQRVisibility() {
      const pm = document.getElementById('paymentMethod').value;
      const qrEl = document.getElementById('qrNotice');
      if (['bkash', 'nagad', 'rocket'].includes(pm)) {
        qrEl.classList.remove('hidden');
      } else {
        qrEl.classList.add('hidden');
      }
    }

    function addToCart(item) {
      const existing = cart.find(c => c.itemId === item.id);
      if (existing) {
        existing.quantity += 1;
        existing.totalPrice = existing.quantity * existing.unitPrice;
      } else {
        cart.push({
          itemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.sellingPrice,
          totalPrice: item.sellingPrice
        });
      }
      renderCart();
    }

    function updateQty(index, delta) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].totalPrice = cart[index].quantity * cart[index].unitPrice;
      }
      renderCart();
    }

    function removeItem(index) {
      cart.splice(index, 1);
      renderCart();
    }

    function clearCart() {
      cart = [];
      document.getElementById('discountInput').value = 0;
      document.getElementById('paidInput').value = 0;
      renderCart();
    }

    function filterMenuItems() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const cat = document.getElementById('categorySelect').value;
      const filtered = menuItems.filter(m => {
        const matchesQ = m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
        const matchesCat = cat === 'all' || m.category === cat;
        return matchesQ && matchesCat;
      });
      renderMenu(filtered);
    }

    function renderCart() {
      const tbody = document.getElementById('cartTableBody');
      const emptyNotice = document.getElementById('emptyCartNotice');
      tbody.innerHTML = '';
      if (cart.length === 0) {
        emptyNotice.style.display = 'block';
      } else {
        emptyNotice.style.display = 'none';
        cart.forEach((item, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td class="p-2 font-medium">\${item.name}</td>
            <td class="p-2 text-center">
              <div class="inline-flex items-center gap-1">
                <button onclick="updateQty(\${idx}, -1)" class="w-5 h-5 bg-stone-200 rounded text-stone-700 font-bold">-</button>
                <span class="font-bold w-4 text-center">\${item.quantity}</span>
                <button onclick="updateQty(\${idx}, 1)" class="w-5 h-5 bg-stone-200 rounded text-stone-700 font-bold">+</button>
              </div>
            </td>
            <td class="p-2 text-right font-bold text-amber-700">৳ \${item.totalPrice}</td>
            <td class="p-2 text-center">
              <button onclick="removeItem(\${idx})" class="text-red-500 hover:text-red-700">✕</button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      }
      renderCartSummary();
    }

    function renderCartSummary() {
      const subtotal = cart.reduce((acc, c) => acc + c.totalPrice, 0);
      const discount = parseFloat(document.getElementById('discountInput').value) || 0;
      const vat = Math.round((subtotal - discount) * 0.05);
      const total = Math.max(0, subtotal - discount + vat);

      document.getElementById('subtotalText').innerText = '৳ ' + subtotal;
      document.getElementById('vatText').innerText = '৳ ' + (vat > 0 ? vat : 0);
      document.getElementById('totalText').innerText = '৳ ' + total;

      calculateChange();
    }

    function calculateChange() {
      const subtotal = cart.reduce((acc, c) => acc + c.totalPrice, 0);
      const discount = parseFloat(document.getElementById('discountInput').value) || 0;
      const vat = Math.round((subtotal - discount) * 0.05);
      const total = Math.max(0, subtotal - discount + vat);
      const paid = parseFloat(document.getElementById('paidInput').value) || 0;
      const change = paid - total;

      const changeEl = document.getElementById('changeText');
      if (change >= 0) {
        changeEl.innerText = 'ফেরত: ৳ ' + change;
        changeEl.className = 'text-emerald-700 font-bold';
      } else {
        changeEl.innerText = 'বাকি: ৳ ' + Math.abs(change);
        changeEl.className = 'text-red-600 font-bold';
      }
    }

    function printBill() {
      if (cart.length === 0) {
        alert('অনুগ্রহ করে অন্তত একটি খাবার মেনু থেকে কার্টে যোগ করুন!');
        return;
      }
      const subtotal = cart.reduce((acc, c) => acc + c.totalPrice, 0);
      const discount = parseFloat(document.getElementById('discountInput').value) || 0;
      const vat = Math.round((subtotal - discount) * 0.05);
      const total = Math.max(0, subtotal - discount + vat);
      const paid = parseFloat(document.getElementById('paidInput').value) || total;
      const change = paid - total;

      document.getElementById('slipInvoiceNo').innerText = 'ইনভয়েস: RC-' + Date.now().toString().slice(-6);
      document.getElementById('slipDateTime').innerText = new Date().toLocaleString('bn-BD');
      document.getElementById('slipOrderType').innerText = document.getElementById('orderType').selectedOptions[0].text;
      document.getElementById('slipTableNo').innerText = document.getElementById('tableNo').value;

      const slipItems = document.getElementById('slipItems');
      slipItems.innerHTML = '';
      cart.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td class="py-0.5">\${item.name}</td>
          <td class="py-0.5 text-center">\${item.quantity}</td>
          <td class="py-0.5 text-right font-medium">৳ \${item.totalPrice}</td>
        \`;
        slipItems.appendChild(tr);
      });

      document.getElementById('slipSubtotal').innerText = '৳ ' + subtotal;
      document.getElementById('slipDiscount').innerText = '৳ ' + discount;
      document.getElementById('slipVat').innerText = '৳ ' + vat;
      document.getElementById('slipTotal').innerText = '৳ ' + total;
      document.getElementById('slipPaid').innerText = '৳ ' + paid;
      document.getElementById('slipChange').innerText = change >= 0 ? 'ফেরত: ৳ ' + change : 'বাকি: ৳ ' + Math.abs(change);

      window.print();
    }

    // Initialize
    renderMenu(menuItems);
    renderCart();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `restaurant-calculator.html`;
  a.click();
  URL.revokeObjectURL(url);
}
