import React, { useState, useEffect } from 'react';
import {
  AppState,
  Order,
  MenuItem,
  RestaurantTable,
  Customer,
  CustomerPayment,
  Expense,
  Restaurant,
  CurrencyType,
  AdminAuth,
  AffiliateConfig,
} from './types';
import { loadAppState, saveAppState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { PosBilling } from './components/PosBilling';
import { TableManagement } from './components/TableManagement';
import { MenuManagement } from './components/MenuManagement';
import { ProfitLoss } from './components/ProfitLoss';
import { CustomerDue } from './components/CustomerDue';
import { Reports } from './components/Reports';
import { ReceiptModal } from './components/ReceiptModal';
import { MultiRestaurantModal } from './components/MultiRestaurantModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AffiliateView } from './components/AffiliateView';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeView, setActiveView] = useState<
    'pos' | 'tables' | 'menu' | 'reports' | 'due' | 'profit' | 'affiliate'
  >('pos');

  // Dark mode (syncs with body.dark-theme and .dark)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('rc_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // Online / Offline tracking
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Admin Auth state
  const [adminAuth, setAdminAuth] = useState<AdminAuth>(() => {
    try {
      const saved = sessionStorage.getItem('rc_admin_auth');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { isAuthenticated: false, username: '' };
  });

  // Modals state
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Active receipt for printing / preview
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptKOT, setIsReceiptKOT] = useState<boolean>(false);

  // Preselected table from Table Management to POS
  const [preselectedTableId, setPreselectedTableId] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Dark mode class on <html> and <body>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
      localStorage.setItem('rc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('rc_theme', 'light');
    }
  }, [isDarkMode]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Current active restaurant
  const currentRestaurant =
    appState.restaurants.find((r) => r.id === appState.currentRestaurantId) ||
    appState.restaurants[0];

  // Active restaurant scoped data
  const restaurantMenuItems = appState.menuItems;
  const restaurantTables = appState.tables;
  const restaurantOrders = appState.orders.filter(
    (o) => o.restaurantId === currentRestaurant.id
  );
  const restaurantCustomers = appState.customers.filter(
    (c) => c.restaurantId === currentRestaurant.id
  );
  const restaurantExpenses = appState.expenses.filter(
    (e) => e.restaurantId === currentRestaurant.id
  );
  const restaurantPayments = appState.customerPayments.filter(
    (p) => p.restaurantId === currentRestaurant.id
  );

  // Currency handler
  const handleCurrencyChange = (curr: CurrencyType) => {
    setAppState((prev) => ({
      ...prev,
      currency: curr,
    }));
  };

  // Order Completion
  const handleCompleteOrder = (order: Order) => {
    setAppState((prev) => {
      // 1. Add order to orders list
      const existingOrderIdx = prev.orders.findIndex((o) => o.id === order.id);
      let updatedOrders: Order[];
      if (existingOrderIdx > -1) {
        updatedOrders = [...prev.orders];
        updatedOrders[existingOrderIdx] = order;
      } else {
        updatedOrders = [order, ...prev.orders];
      }

      // 2. If table was occupied by this order, free up the table
      const updatedTables = prev.tables.map((t) => {
        if (t.id === order.tableId || t.currentOrderId === order.id) {
          return {
            ...t,
            status: 'available' as const,
            currentOrderId: undefined,
          };
        }
        return t;
      });

      // 3. Update customer stats if customer is attached
      let updatedCustomers = [...prev.customers];
      if (order.customerId) {
        updatedCustomers = updatedCustomers.map((c) => {
          if (c.id === order.customerId) {
            return {
              ...c,
              totalSpent: c.totalSpent + order.totalAmount,
              totalPaid: c.totalPaid + order.paidAmount,
              totalDue: c.totalDue + order.dueAmount,
            };
          }
          return c;
        });
      }

      return {
        ...prev,
        orders: updatedOrders,
        tables: updatedTables,
        customers: updatedCustomers,
      };
    });
  };

  // Hold Table Order
  const handleHoldTableOrder = (tableId: string, order: Order) => {
    setAppState((prev) => {
      const existingOrderIdx = prev.orders.findIndex(
        (o) => o.id === order.id || (o.tableId === tableId && o.status === 'running')
      );
      let updatedOrders = [...prev.orders];
      if (existingOrderIdx > -1) {
        updatedOrders[existingOrderIdx] = order;
      } else {
        updatedOrders = [order, ...prev.orders];
      }

      const updatedTables = prev.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'occupied' as const,
            currentOrderId: order.id,
          };
        }
        return t;
      });

      return {
        ...prev,
        orders: updatedOrders,
        tables: updatedTables,
      };
    });
  };

  // Open Receipt Modal
  const handleOpenReceipt = (order: Order, isKOT: boolean = false) => {
    setActiveReceiptOrder(order);
    setIsReceiptKOT(isKOT);
  };

  // Switch to POS from Table Management
  const handleSelectTableForBilling = (tableId: string) => {
    setPreselectedTableId(tableId);
    setActiveView('pos');
  };

  // Record Customer Due Payment
  const handleRecordPayment = (payment: CustomerPayment) => {
    setAppState((prev) => {
      const updatedPayments = [payment, ...prev.customerPayments];
      const updatedCustomers = prev.customers.map((c) => {
        if (c.id === payment.customerId) {
          return {
            ...c,
            totalPaid: c.totalPaid + payment.amount,
            totalDue: Math.max(0, c.totalDue - payment.amount),
          };
        }
        return c;
      });

      return {
        ...prev,
        customerPayments: updatedPayments,
        customers: updatedCustomers,
      };
    });
  };

  // Add / Update / Delete Menu Item
  const handleAddMenuItem = (item: MenuItem) => {
    setAppState((prev) => ({
      ...prev,
      menuItems: [item, ...prev.menuItems],
    }));
  };

  const handleUpdateMenuItem = (item: MenuItem) => {
    setAppState((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((m) => (m.id === item.id ? item : m)),
    }));
  };

  const handleDeleteMenuItem = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m) => m.id !== id),
    }));
  };

  // Add / Delete Expense
  const handleAddExpense = (expense: Expense) => {
    setAppState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Customer Management
  const handleAddCustomer = (customer: Customer) => {
    setAppState((prev) => ({
      ...prev,
      customers: [customer, ...prev.customers],
    }));
  };

  // Table Management
  const handleAddTable = (newTable: RestaurantTable) => {
    setAppState((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));
  };

  const handleClearTable = (tableId: string) => {
    setAppState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'available' as const, currentOrderId: undefined } : t
      ),
    }));
  };

  // Restaurant Switcher & Multi-restaurant
  const handleSelectRestaurant = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      currentRestaurantId: id,
    }));
  };

  const handleAddRestaurant = (newRest: Restaurant) => {
    setAppState((prev) => ({
      ...prev,
      restaurants: [...prev.restaurants, newRest],
      currentRestaurantId: newRest.id,
    }));
  };

  const handleUpdateRestaurant = (updatedRest: Restaurant) => {
    setAppState((prev) => ({
      ...prev,
      restaurants: prev.restaurants.map((r) => (r.id === updatedRest.id ? updatedRest : r)),
    }));
  };

  // Admin Auth Handlers
  const handleAdminLogin = (auth: AdminAuth) => {
    setAdminAuth(auth);
    sessionStorage.setItem('rc_admin_auth', JSON.stringify(auth));
  };

  const handleAdminLogout = () => {
    const fresh = { isAuthenticated: false, username: '' };
    setAdminAuth(fresh);
    sessionStorage.removeItem('rc_admin_auth');
  };

  const handleUpdateAffiliateConfig = (config: AffiliateConfig) => {
    setAppState((prev) => ({
      ...prev,
      affiliateConfig: config,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/70 dark:bg-[#121212] text-stone-900 dark:text-[#e9ecef] transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        currentRestaurant={currentRestaurant}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenRestaurantModal={() => setIsRestaurantModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        adminAuth={adminAuth}
        currency={appState.currency || 'BDT'}
        onChangeCurrency={handleCurrencyChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOnline={isOnline}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activeView === 'pos' && (
          <PosBilling
            restaurant={currentRestaurant}
            menuItems={restaurantMenuItems}
            tables={restaurantTables}
            customers={restaurantCustomers}
            orders={restaurantOrders}
            currency={appState.currency || 'BDT'}
            onCompleteOrder={handleCompleteOrder}
            onHoldTableOrder={handleHoldTableOrder}
            onAddCustomItemToMenu={handleAddMenuItem}
            onAddCustomer={handleAddCustomer}
            onOpenReceipt={handleOpenReceipt}
            preselectedTableId={preselectedTableId}
            onClearPreselectedTable={() => setPreselectedTableId(null)}
          />
        )}

        {activeView === 'tables' && (
          <TableManagement
            tables={restaurantTables}
            orders={restaurantOrders}
            onSelectTableForBilling={handleSelectTableForBilling}
            onClearTable={handleClearTable}
            onAddTable={handleAddTable}
            onOpenReceipt={(ord) => handleOpenReceipt(ord, false)}
          />
        )}

        {activeView === 'menu' && (
          <MenuManagement
            menuItems={restaurantMenuItems}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        )}

        {activeView === 'profit' && (
          <ProfitLoss
            restaurant={currentRestaurant}
            orders={restaurantOrders}
            expenses={restaurantExpenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeView === 'due' && (
          <CustomerDue
            restaurant={currentRestaurant}
            customers={restaurantCustomers}
            orders={restaurantOrders}
            payments={restaurantPayments}
            onAddCustomer={handleAddCustomer}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {activeView === 'reports' && (
          <Reports
            restaurant={currentRestaurant}
            orders={restaurantOrders}
            onOpenReceipt={(ord) => handleOpenReceipt(ord, false)}
          />
        )}

        {activeView === 'affiliate' && (
          <AffiliateView
            affiliateConfig={appState.affiliateConfig}
            restaurant={currentRestaurant}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      {activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          restaurant={currentRestaurant}
          isOpen={!!activeReceiptOrder}
          onClose={() => setActiveReceiptOrder(null)}
          isKOT={isReceiptKOT}
        />
      )}

      <MultiRestaurantModal
        restaurants={appState.restaurants}
        currentRestaurantId={currentRestaurant.id}
        isOpen={isRestaurantModalOpen}
        onClose={() => setIsRestaurantModalOpen(false)}
        onSelectRestaurant={handleSelectRestaurant}
        onAddRestaurant={handleAddRestaurant}
        onUpdateRestaurant={handleUpdateRestaurant}
      />

      <StandaloneExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        appState={appState}
        onRestoreState={(newState) => setAppState(newState)}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminAuth={adminAuth}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        affiliateConfig={appState.affiliateConfig}
        onUpdateAffiliateConfig={handleUpdateAffiliateConfig}
        currentRestaurant={currentRestaurant}
        onUpdateRestaurant={handleUpdateRestaurant}
      />
    </div>
  );
}
