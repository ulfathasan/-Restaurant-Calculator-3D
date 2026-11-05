export type CurrencyType = 'BDT' | 'INR' | 'USD';

export interface Restaurant {
  id: string;
  name: string;
  branch: string;
  address: string;
  phone: string;
  vatBin?: string;
  vatPercent: number;
  serviceChargePercent: number;
  currency: string;
  currencyType: CurrencyType;
  receiptFooter: string;
  bkashNumber1?: string;
  bkashNumber2?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  upiId?: string;
  paypalEmail?: string;
}

export type FoodCategory =
  | 'মেজবান স্পেশাল'
  | 'মাছ'
  | 'মাংস'
  | 'ভর্তা ও ভাজি'
  | 'ডাল ও সবজি'
  | 'ভাত ও খিচুড়ি'
  | 'বিরিয়ানি ও তেহারি'
  | 'নাস্তা ও স্ন্যাক্স'
  | 'মিষ্টি ও ডেজার্ট'
  | 'চা ও ড্রিংকস'
  | 'অন্যান্য';

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  category: FoodCategory | string;
  sellingPrice: number;
  costPrice: number; // Raw material / preparation cost for calculating profit
  available: boolean;
  unit?: string; // প্লেট, বাটি, গ্লাস, পিস, বোতল
  isMezban?: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'billed';

export interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  section?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  notes?: string;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod =
  | 'cash'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'card'
  | 'cod'
  | 'upi'
  | 'paypal'
  | 'due';
export type PaymentStatus = 'paid' | 'partial' | 'due';

export interface Order {
  id: string;
  invoiceNumber: string;
  restaurantId: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  vat: number;
  deliveryCharge: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: 'running' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  notes?: string;
  currency: string;
}

export interface Customer {
  id: string;
  restaurantId: string;
  name: string;
  phone: string;
  address?: string;
  totalSpent: number;
  totalPaid: number;
  totalDue: number;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  restaurantId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
  receiptNumber: string;
}

export type ExpenseCategory =
  | 'দোকান ভাড়া'
  | 'কর্মচারী বেতন'
  | 'বিদ্যুৎ ও পানি বিল'
  | 'গ্যাস ও সিলিন্ডার'
  | 'কাঁচামাল ও মশলা বাজার'
  | 'পরিবহন ও যাতায়াত'
  | 'মেরামত ও রক্ষণাবেক্ষণ'
  | 'অন্যান্য খরচ';

export interface Expense {
  id: string;
  restaurantId: string;
  category: ExpenseCategory | string;
  amount: number;
  date: string;
  description: string;
  spentBy?: string;
}

export interface AffiliateConfig {
  storeUrl: string;
  title: string;
  description: string;
  whatsapp: string;
  email: string;
}

export interface AdminAuth {
  isAuthenticated: boolean;
  username: string;
  lastLogin?: string;
}

export interface AppState {
  restaurants: Restaurant[];
  currentRestaurantId: string;
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  orders: Order[];
  customers: Customer[];
  customerPayments: CustomerPayment[];
  expenses: Expense[];
  activeView: 'pos' | 'tables' | 'menu' | 'reports' | 'due' | 'profit' | 'affiliate';
  currency: CurrencyType;
  affiliateConfig: AffiliateConfig;
}
