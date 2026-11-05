import React from 'react';
import { Restaurant, CurrencyType, AdminAuth } from '../types';
import {
  Store,
  Download,
  Moon,
  Sun,
  Utensils,
  Wifi,
  WifiOff,
  ShoppingBag,
  ShieldCheck,
  Phone,
  Coins,
} from 'lucide-react';

interface NavbarProps {
  currentRestaurant: Restaurant;
  activeView: 'pos' | 'tables' | 'menu' | 'reports' | 'due' | 'profit' | 'affiliate';
  setActiveView: (view: 'pos' | 'tables' | 'menu' | 'reports' | 'due' | 'profit' | 'affiliate') => void;
  onOpenRestaurantModal: () => void;
  onOpenExportModal: () => void;
  onOpenAdminModal: () => void;
  adminAuth: AdminAuth;
  currency: CurrencyType;
  onChangeCurrency: (currency: CurrencyType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRestaurant,
  activeView,
  setActiveView,
  onOpenRestaurantModal,
  onOpenExportModal,
  onOpenAdminModal,
  adminAuth,
  currency,
  onChangeCurrency,
  isDarkMode,
  onToggleDarkMode,
  isOnline,
}) => {
  const navLinks = [
    { id: 'pos' as const, label: 'বিলিং (POS)' },
    { id: 'tables' as const, label: 'টেবিল ও অর্ডার' },
    { id: 'menu' as const, label: 'খাবারের মেনু (১১২+)' },
    { id: 'profit' as const, label: 'লাভ-ক্ষতি' },
    { id: 'due' as const, label: 'বাকির খাতা' },
    { id: 'reports' as const, label: 'রিপোর্ট' },
    { id: 'affiliate' as const, label: 'অ্যাফিলিয়েট শপ' },
  ];

  return (
    <header className="no-print bg-white dark:bg-[#1e1e1e] border-b border-stone-200 dark:border-[#495057] sticky top-0 z-40 transition-colors shadow-sm">
      {/* Top micro bar for Contact & Admin quick info */}
      <div className="bg-amber-700 text-amber-50 px-4 sm:px-6 py-1 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Phone className="w-3 h-3 text-amber-300" />
            WhatsApp: <strong className="text-white">+88 01817 220921</strong>
          </span>
          <span className="hidden sm:inline text-amber-300">·</span>
          <span className="hidden sm:inline font-mono">ulfathasan44@gmail.com</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-amber-800/80 px-2 py-0.5 rounded text-[10px] font-bold">
            <Coins className="w-3 h-3 text-amber-300" />
            <span>মুদ্রা:</span>
            {(['BDT', 'INR', 'USD'] as CurrencyType[]).map((c) => (
              <button
                key={c}
                onClick={() => onChangeCurrency(c)}
                className={`px-1.5 rounded transition ${
                  currency === c ? 'bg-amber-500 text-stone-900 font-black' : 'hover:text-white'
                }`}
              >
                {c === 'BDT' ? '৳ BDT' : c === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            ))}
          </div>

          {/* Admin status button */}
          <button
            onClick={onOpenAdminModal}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
              adminAuth.isAuthenticated
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-800 hover:bg-amber-900 text-amber-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{adminAuth.isAuthenticated ? 'অ্যাডমিন: SP TUPRHASAN' : 'অ্যাডমিন লগইন'}</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand element */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('pos')}
            className="flex items-center gap-2.5 text-left group"
          >
            <span className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 text-white font-black flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-all">
              🍽️
            </span>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap block leading-tight">
                Restaurant Calculator
              </span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap block">
                বাংলা হোটেল ও মেজবান রেস্টুরেন্ট বিলিং
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap shrink-0 transition-all ${
                activeView === link.id
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Restaurant Switcher, Export, Theme, Connectivity) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Restaurant Selector */}
          <button
            onClick={onOpenRestaurantModal}
            className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition max-w-[170px] btn-3d"
            title="রেস্টুরেন্ট বা শাখা পরিবর্তন করুন"
          >
            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{currentRestaurant.name}</span>
          </button>

          {/* Standalone HTML Export Modal Trigger */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold items-center gap-1.5 shadow-md transition whitespace-nowrap shrink-0 btn-3d"
            title="একক অফলাইন ফাইল হিসেবে ডাউনলোড করুন (public_html রেডি)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>অফলাইন ফাইল (.html)</span>
          </button>

          {/* Online / Offline status badge */}
          <div
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              isOnline
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
            }`}
            title={isOnline ? 'ইন্টারনেট সংযুক্ত' : 'অফলাইন মোড'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            title={isDarkMode ? 'লাইট মোড অন করুন' : 'ডার্ক মোড অন করুন'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Strip (visible on mobile viewports) */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto bg-stone-50 dark:bg-[#1e1e1e] border-t border-stone-200 dark:border-[#495057] scrollbar-none text-xs">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveView(link.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors font-medium ${
              activeView === link.id
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
