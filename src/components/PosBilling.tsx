import React, { useState, useMemo } from 'react';
import {
  MenuItem,
  OrderItem,
  Order,
  Restaurant,
  RestaurantTable,
  Customer,
  OrderType,
  PaymentMethod,
  FoodCategory,
  CurrencyType,
} from '../types';
import { formatTaka, toBn, generateInvoiceNumber } from '../utils/numberConverter';
import { QRCodeDisplay } from './QRCodeDisplay';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  ChefHat,
  Save,
  RotateCcw,
  UserPlus,
  ShoppingBag,
  Utensils,
  Truck,
  PlusCircle,
  QrCode,
  Sparkles,
  Flame,
} from 'lucide-react';

interface PosBillingProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  customers: Customer[];
  orders: Order[];
  currency: CurrencyType;
  onCompleteOrder: (order: Order) => void;
  onHoldTableOrder: (tableId: string, order: Order) => void;
  onAddCustomItemToMenu: (item: MenuItem) => void;
  onAddCustomer: (customer: Customer) => void;
  onOpenReceipt: (order: Order, isKOT?: boolean) => void;
  preselectedTableId?: string | null;
  onClearPreselectedTable?: () => void;
}

const CATEGORIES: (FoodCategory | 'সব খাবার')[] = [
  'সব খাবার',
  'মেজবান স্পেশাল',
  'মাছ',
  'মাংস',
  'ভর্তা ও ভাজি',
  'ডাল ও সবজি',
  'ভাত ও খিচুড়ি',
  'বিরিয়ানি ও তেহারি',
  'নাস্তা ও স্ন্যাক্স',
  'মিষ্টি ও ডেজার্ট',
  'চা ও ড্রিংকস',
];

export const PosBilling: React.FC<PosBillingProps> = ({
  restaurant,
  menuItems,
  tables,
  customers,
  orders,
  currency,
  onCompleteOrder,
  onHoldTableOrder,
  onAddCustomItemToMenu,
  onAddCustomer,
  onOpenReceipt,
  preselectedTableId,
  onClearPreselectedTable,
}) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('সব খাবার');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart / Order state
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string>(preselectedTableId || (tables[0]?.id || ''));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [notes, setNotes] = useState('');

  // Financial inputs
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [applyVat, setApplyVat] = useState<boolean>(true);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidInput, setPaidInput] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  // Custom Item Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('মেজবান স্পেশাল');

  // New Customer Modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Check if a preselected table has an active order to resume
  React.useEffect(() => {
    if (preselectedTableId) {
      setSelectedTableId(preselectedTableId);
      setOrderType('dine-in');
      const table = tables.find((t) => t.id === preselectedTableId);
      if (table && table.currentOrderId) {
        const existingOrder = orders.find((o) => o.id === table.currentOrderId);
        if (existingOrder) {
          setCartItems(existingOrder.items);
          setDiscountValue(existingOrder.discount);
          setDiscountType(existingOrder.discountType);
          setNotes(existingOrder.notes || '');
          if (existingOrder.customerId) setSelectedCustomerId(existingOrder.customerId);
          if (existingOrder.customerName) setCustomerNameInput(existingOrder.customerName);
          if (existingOrder.customerPhone) setCustomerPhoneInput(existingOrder.customerPhone);
        }
      }
    }
  }, [preselectedTableId, tables, orders]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'সব খাবার' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.itemId === item.id);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + 1;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          totalPrice: newQty * updated[idx].unitPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.sellingPrice,
          unitCost: item.costPrice,
          totalPrice: item.sellingPrice,
        },
      ];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        totalPrice: newQty * updated[index].unitPrice,
      };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountValue(0);
    setPaidInput('');
    setNotes('');
    setShowQR(false);
    if (onClearPreselectedTable) onClearPreselectedTable();
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return Math.round((subtotal * discountValue) / 100);
    }
    return Math.min(subtotal, discountValue);
  }, [subtotal, discountValue, discountType]);

  const vatAmount = useMemo(() => {
    if (!applyVat || restaurant.vatPercent <= 0) return 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    return Math.round((taxable * restaurant.vatPercent) / 100);
  }, [subtotal, discountAmount, applyVat, restaurant.vatPercent]);

  const finalTotal = useMemo(() => {
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const deliv = orderType === 'delivery' ? deliveryCharge : 0;
    return Math.max(0, afterDiscount + vatAmount + deliv);
  }, [subtotal, discountAmount, vatAmount, deliveryCharge, orderType]);

  const numericPaid = paidInput === '' ? 0 : parseFloat(paidInput) || 0;
  const changeAmount = paymentMethod === 'due' ? 0 : Math.max(0, numericPaid - finalTotal);
  const dueAmount =
    paymentMethod === 'due'
      ? finalTotal
      : Math.max(0, finalTotal - (paidInput === '' ? finalTotal : numericPaid));

  const handleQuickPaid = (amount: number) => {
    setPaidInput(amount.toString());
  };

  // Add custom food on the fly
  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice) return;
    const sp = parseFloat(customPrice) || 0;
    const cp = parseFloat(customCost) || Math.round(sp * 0.55);
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      sellingPrice: sp,
      costPrice: cp,
      available: true,
      unit: 'প্লেট',
    };
    onAddCustomItemToMenu(newItem);
    addToCart(newItem);
    setCustomName('');
    setCustomPrice('');
    setCustomCost('');
    setShowCustomModal(false);
  };

  // Quick Customer Creation
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    const newCust: Customer = {
      id: `c-${Date.now()}`,
      restaurantId: restaurant.id,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      totalSpent: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    onAddCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setCustomerNameInput(newCust.name);
    setCustomerPhoneInput(newCust.phone);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowCustomerModal(false);
  };

  // Complete Order
  const handleCheckout = (autoPrint: boolean = true) => {
    if (cartItems.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি খাবার মেনু থেকে কার্টে যোগ করুন!');
      return;
    }

    if (paymentMethod === 'due' && !customerNameInput && !selectedCustomerId) {
      alert('বাকি (Due) বিক্রির জন্য কাস্টমারের নাম অথবা ফোন নম্বর আবশ্যক!');
      return;
    }

    const currentTable = tables.find((t) => t.id === selectedTableId);
    const customerObj = customers.find((c) => c.id === selectedCustomerId);

    const effectivePaid =
      paymentMethod === 'due' ? 0 : paidInput === '' ? finalTotal : Math.min(finalTotal, numericPaid);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(orders.length),
      restaurantId: restaurant.id,
      orderType,
      tableId: orderType === 'dine-in' ? selectedTableId : undefined,
      tableName: orderType === 'dine-in' ? currentTable?.name : undefined,
      customerId: selectedCustomerId || undefined,
      customerName: customerNameInput || customerObj?.name || 'ক্যাশ কাস্টমার',
      customerPhone: customerPhoneInput || customerObj?.phone,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      discountType,
      vat: vatAmount,
      deliveryCharge: orderType === 'delivery' ? deliveryCharge : 0,
      totalAmount: finalTotal,
      paidAmount: effectivePaid,
      dueAmount,
      changeAmount,
      paymentMethod,
      paymentStatus: dueAmount === 0 ? 'paid' : effectivePaid > 0 ? 'partial' : 'due',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes,
      currency: currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '৳',
    };

    onCompleteOrder(newOrder);

    if (autoPrint) {
      onOpenReceipt(newOrder, false);
    }

    clearCart();
  };

  // Hold Table Order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      alert('কার্টে কোনো খাবার নেই!');
      return;
    }
    if (orderType !== 'dine-in') {
      alert('টেবিলে অর্ডার ধরে রাখার জন্য অর্ডার ধরন "ডাইন-ইন" নির্বাচন করুন।');
      return;
    }

    const currentTable = tables.find((t) => t.id === selectedTableId);
    const customerObj = customers.find((c) => c.id === selectedCustomerId);

    const holdOrder: Order = {
      id: `ord-running-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(orders.length),
      restaurantId: restaurant.id,
      orderType: 'dine-in',
      tableId: selectedTableId,
      tableName: currentTable?.name,
      customerId: selectedCustomerId || undefined,
      customerName: customerNameInput || customerObj?.name || 'ক্যাশ কাস্টমার',
      customerPhone: customerPhoneInput || customerObj?.phone,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      discountType,
      vat: vatAmount,
      deliveryCharge: 0,
      totalAmount: finalTotal,
      paidAmount: 0,
      dueAmount: finalTotal,
      changeAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'due',
      status: 'running',
      createdAt: new Date().toISOString(),
      notes,
      currency: currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '৳',
    };

    onHoldTableOrder(selectedTableId, holdOrder);
    alert(`${currentTable?.name || 'টেবিল'}-এ অর্ডারটি সেভ করা হয়েছে।`);
    clearCart();
  };

  // Kitchen Order Token (KOT)
  const handlePrintKOT = () => {
    if (cartItems.length === 0) {
      alert('কিচেন টোকেন তৈরির জন্য কার্টে খাবার যোগ করুন!');
      return;
    }
    const currentTable = tables.find((t) => t.id === selectedTableId);
    const tempOrder: Order = {
      id: `kot-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(orders.length),
      restaurantId: restaurant.id,
      orderType,
      tableId: selectedTableId,
      tableName: currentTable?.name,
      items: cartItems,
      subtotal,
      discount: 0,
      discountType: 'fixed',
      vat: 0,
      deliveryCharge: 0,
      totalAmount: subtotal,
      paidAmount: 0,
      dueAmount: subtotal,
      changeAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'due',
      status: 'running',
      createdAt: new Date().toISOString(),
      notes,
      currency: currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '৳',
    };
    onOpenReceipt(tempOrder, true);
  };

  const isDigitalPayment = ['bkash', 'nagad', 'rocket', 'upi', 'paypal'].includes(paymentMethod);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT SECTION: Food Menu & Categories (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Top Controls: Search + Custom item button */}
        <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl border border-stone-200 dark:border-[#495057] shadow-sm card-3d flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খাবার খুঁজুন (যেমন: মেজবান, ইলিশ, রূপচাঁদা, পোয়া, কাচ্চি, ভর্তা...)"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition btn-3d"
          >
            <PlusCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>কাস্টম খাবার যোগ</span>
          </button>
        </div>

        {/* Categories Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-md scale-102 font-bold'
                  : 'bg-white dark:bg-[#1e1e1e] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-[#495057]'
              }`}
            >
              {cat === 'মেজবান স্পেশাল' && <Flame className="w-3 h-3 inline mr-1 text-red-300 animate-pulse" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items 3D Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {filteredMenuItems.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white dark:bg-[#1e1e1e] rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
              <p className="text-stone-400 text-sm">কোনো খাবার পাওয়া যায়নি।</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('সব খাবার');
                }}
                className="mt-2 text-xs font-semibold text-amber-600 hover:underline"
              >
                সব খাবার দেখান
              </button>
            </div>
          ) : (
            filteredMenuItems.map((item) => {
              const inCartItem = cartItems.find((i) => i.itemId === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`group relative bg-white dark:bg-[#1e1e1e] border rounded-2xl p-3 cursor-pointer transition-all duration-200 card-3d flex flex-col justify-between select-none ${
                    inCartItem
                      ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-[#495057] hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                        {item.isMezban && <Flame className="w-2.5 h-2.5 text-red-500 inline" />}
                        {item.category}
                      </span>
                      {item.unit && (
                        <span className="text-[10px] text-stone-400">/{item.unit}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs md:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="font-black text-sm text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatTaka(item.sellingPrice, currency)}
                    </span>

                    {inCartItem ? (
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                        {toBn(inCartItem.quantity)}
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Active Cart & 3D Billing Terminal (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-[#1e1e1e] border border-stone-200 dark:border-[#495057] rounded-3xl shadow-xl card-3d overflow-hidden flex flex-col">
        {/* Cart Top Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-xl">
                <Utensils className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm md:text-base text-stone-900 dark:text-stone-100">
                বিলিং ও ক্যাশ মেমো
              </h3>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                নতুন বিল
              </button>
            )}
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl text-xs font-semibold mb-3">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                orderType === 'dine-in'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              টেবিল
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                orderType === 'takeaway'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              পার্সেল
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                orderType === 'delivery'
                  ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              ডেলিভারি
            </button>
          </div>

          {/* Conditional Table or Customer Selectors */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {orderType === 'dine-in' ? (
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  টেবিল নির্বাচন:
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.status === 'occupied' ? '(রানিং)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  কাস্টমার নাম:
                </label>
                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  placeholder="গ্রাহকের নাম"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-stone-500">
                  বাকির খাতা / ফোন:
                </label>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="text-[10px] text-amber-600 hover:underline flex items-center gap-0.5"
                >
                  <UserPlus className="w-2.5 h-2.5" /> নতুন
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCustomerId(id);
                  const cust = customers.find((c) => c.id === id);
                  if (cust) {
                    setCustomerNameInput(cust.name);
                    setCustomerPhoneInput(cust.phone);
                  }
                }}
                className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              >
                <option value="">ক্যাশ কাস্টমার (সাধারণ)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.totalDue > 0 ? `(বাকি: ${formatTaka(c.totalDue, currency)})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="p-3 max-h-[220px] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <p className="text-xs">কার্ট খালি। বামদিকের মেনু থেকে খাবারে ক্লিক করুন।</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {item.name}
                  </h5>
                  <p className="text-[11px] text-stone-400 tabular-nums">
                    {formatTaka(item.unitPrice, currency)}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 font-bold transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-xs tabular-nums text-stone-900 dark:text-stone-100">
                    {toBn(item.quantity)}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 font-bold transition"
                  >
                    +
                  </button>
                </div>

                <div className="w-20 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {formatTaka(item.totalPrice, currency)}
                </div>

                <button
                  onClick={() => removeFromCart(idx)}
                  className="p-1 text-stone-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Financial Calculation Panel */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 space-y-2 text-xs">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>সাবটোটাল:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {formatTaka(subtotal, currency)}
            </span>
          </div>

          {/* Discount Field */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-600 dark:text-stone-400">ডিসকাউন্ট:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="০"
                className="w-16 text-right p-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs tabular-nums font-semibold"
              />
              <button
                onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')}
                className="px-2 py-1 bg-stone-200 dark:bg-stone-800 rounded-lg text-[11px] font-bold text-stone-700 dark:text-stone-300"
              >
                {discountType === 'fixed' ? 'টাকা' : '%'}
              </button>
            </div>
          </div>

          {/* VAT Toggle */}
          {restaurant.vatPercent > 0 && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-400">
                <input
                  type="checkbox"
                  checked={applyVat}
                  onChange={(e) => setApplyVat(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>ভ্যাট ({toBn(restaurant.vatPercent)}%):</span>
              </label>
              <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                {formatTaka(vatAmount, currency)}
              </span>
            </div>
          )}

          {/* Delivery charge if delivery */}
          {orderType === 'delivery' && (
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-400">ডেলিভারি চার্জ:</span>
              <input
                type="number"
                min="0"
                value={deliveryCharge || ''}
                onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                placeholder="০"
                className="w-16 text-right p-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs tabular-nums font-semibold"
              />
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-800 font-black text-base text-stone-950 dark:text-white">
            <span>সর্বমোট বিল:</span>
            <span className="text-amber-600 dark:text-amber-400 tabular-nums text-lg">
              {formatTaka(finalTotal, currency)}
            </span>
          </div>

          {/* Payment Method Badges (Comprehensive) */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                পরিশোধের মাধ্যম (Payment Method):
              </label>
              {isDigitalPayment && (
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="text-[11px] text-amber-600 font-bold flex items-center gap-1 hover:underline"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {showQR ? 'কিউআর বন্ধ করুন' : 'Scan & Pay QR কোড'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[10px] sm:text-[11px] font-bold">
              <button
                onClick={() => { setPaymentMethod('cash'); setShowQR(false); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                নগদ (Cash)
              </button>
              <button
                onClick={() => { setPaymentMethod('bkash'); setShowQR(true); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                বিকাশ (bKash)
              </button>
              <button
                onClick={() => { setPaymentMethod('nagad'); setShowQR(true); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                নগদ (Nagad)
              </button>
              <button
                onClick={() => { setPaymentMethod('rocket'); setShowQR(true); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'rocket'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                রকেট (Rocket)
              </button>
              <button
                onClick={() => { setPaymentMethod('cod'); setShowQR(false); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'cod'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                COD
              </button>
              <button
                onClick={() => { setPaymentMethod('upi'); setShowQR(true); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'upi'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                UPI QR
              </button>
              <button
                onClick={() => { setPaymentMethod('paypal'); setShowQR(true); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'paypal'
                    ? 'bg-sky-700 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                PayPal / Card
              </button>
              <button
                onClick={() => { setPaymentMethod('due'); setShowQR(false); }}
                className={`py-1.5 rounded-lg transition btn-3d ${
                  paymentMethod === 'due'
                    ? 'bg-red-600 text-white font-black'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                বাকি (Due)
              </button>
            </div>
          </div>

          {/* Scan & Pay QR Code Live View if digital method selected */}
          {showQR && isDigitalPayment && (
            <QRCodeDisplay
              method={paymentMethod}
              amount={finalTotal}
              currency={currency}
              bkash1={restaurant.bkashNumber1 || '০১৫৫৮৪৫২৯২৯'}
              bkash2={restaurant.bkashNumber2 || '০১৮১৭২২০৯২১'}
              nagad={restaurant.nagadNumber || '০১৮১৭২২০৯২১'}
              rocket={restaurant.rocketNumber || '০১৮১৭২২০৯২১'}
              upiId={restaurant.upiId || 'restaurant@upi'}
              paypalEmail={restaurant.paypalEmail || 'ulfathasan44@gmail.com'}
            />
          )}

          {/* Customer Paid and Change calculation */}
          {paymentMethod !== 'due' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-600 dark:text-stone-400">কাস্টমার দিল ({currency}):</span>
                <input
                  type="number"
                  min="0"
                  value={paidInput}
                  onChange={(e) => setPaidInput(e.target.value)}
                  placeholder={finalTotal.toString()}
                  className="w-28 text-right p-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-bold tabular-nums text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Quick Money Buttons */}
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => handleQuickPaid(finalTotal)}
                  className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded text-[10px] font-semibold"
                >
                  সমান ({formatTaka(finalTotal, currency)})
                </button>
                {[500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickPaid(amt)}
                    className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded text-[10px] font-semibold"
                  >
                    {formatTaka(amt, currency)}
                  </button>
                ))}
              </div>

              {/* Change / Due result badge */}
              <div
                className={`p-2 rounded-xl text-xs font-bold flex justify-between ${
                  changeAmount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : dueAmount > 0
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <span>{changeAmount > 0 ? 'কাস্টমারকে ফেরত দিন:' : dueAmount > 0 ? 'বাকি থাকবে:' : 'হিসাব সম্পন্ন:'}</span>
                <span className="tabular-nums">
                  {changeAmount > 0
                    ? formatTaka(changeAmount, currency)
                    : dueAmount > 0
                    ? formatTaka(dueAmount, currency)
                    : formatTaka(0, currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Bottom Action Buttons with 3D tactile elevation */}
        <div className="p-3 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-2">
          {orderType === 'dine-in' && (
            <button
              onClick={handleHoldOrder}
              className="px-3 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition btn-3d"
            >
              <Save className="w-3.5 h-3.5 text-amber-600" />
              টেবিলে সেভ রাখুন
            </button>
          )}

          <button
            onClick={handlePrintKOT}
            className={`px-3 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition btn-3d ${
              orderType !== 'dine-in' ? 'col-span-1' : ''
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-stone-600" />
            কিচেন টোকেন (KOT)
          </button>

          <button
            onClick={() => handleCheckout(true)}
            className={`py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs md:text-sm font-black shadow-lg flex items-center justify-center gap-2 transition btn-3d ${
              orderType === 'dine-in' ? 'col-span-2' : 'col-span-1'
            }`}
          >
            <Printer className="w-4 h-4" />
            বিল ও ক্যাশ মেমো প্রিন্ট
          </button>
        </div>
      </div>

      {/* MODAL 1: Custom Food Item on-the-fly */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-stone-200 dark:border-stone-800 card-3d">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
              কাস্টম খাবার যোগ করুন
            </h3>
            <form onSubmit={handleSaveCustomItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  খাবারের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="যেমন: স্পেশাল মেজবানি মাংস"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  ক্যাটাগরি:
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as FoodCategory)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                >
                  {CATEGORIES.filter((c) => c !== 'সব খাবার').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">
                    বিক্রয়মূল্য:
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="১৫০"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">
                    ক্রয়মূল্য / খরচ:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    placeholder="৮০"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  কার্টে যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: New Customer for Due / Records */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-sm w-full p-5 border border-stone-200 dark:border-stone-800 card-3d">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
              নতুন কাস্টমার যোগ করুন
            </h3>
            <form onSubmit={handleSaveNewCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  কাস্টমারের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="যেমন: জামাল উদ্দিন"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="০১৭০০-০০০০০০"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1">
                  ঠিকানা বা পরিচয় (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="দোকান বা অফিসের ঠিকানা"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
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
