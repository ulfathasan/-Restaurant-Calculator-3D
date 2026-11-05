import React, { useState } from 'react';
import { AdminAuth, AffiliateConfig, Restaurant } from '../types';
import { ShieldCheck, Lock, User, LogOut, Settings, ExternalLink, Check, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAuth: AdminAuth;
  onLogin: (auth: AdminAuth) => void;
  onLogout: () => void;
  affiliateConfig: AffiliateConfig;
  onUpdateAffiliateConfig: (config: AffiliateConfig) => void;
  currentRestaurant: Restaurant;
  onUpdateRestaurant: (restaurant: Restaurant) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  adminAuth,
  onLogin,
  onLogout,
  affiliateConfig,
  onUpdateAffiliateConfig,
  currentRestaurant,
  onUpdateRestaurant,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings form when logged in
  const [affiliateUrl, setAffiliateUrl] = useState(affiliateConfig.storeUrl);
  const [bkash1, setBkash1] = useState(currentRestaurant.bkashNumber1 || '০১৫৫৮৪৫২৯২৯');
  const [bkash2, setBkash2] = useState(currentRestaurant.bkashNumber2 || '০১৮১৭২২০৯২১');
  const [nagad, setNagad] = useState(currentRestaurant.nagadNumber || '০১৮১৭২২০৯২১');
  const [whatsapp, setWhatsapp] = useState(affiliateConfig.whatsapp);
  const [email, setEmail] = useState(affiliateConfig.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'SP TUPRHASAN' && password.trim() === 'Bangla220921') {
      onLogin({
        isAuthenticated: true,
        username: 'SP TUPRHASAN',
        lastLogin: new Date().toISOString(),
      });
      setErrorMsg('');
    } else {
      setErrorMsg('লগইন আইডি অথবা পাসওয়ার্ড সঠিক নয়!');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAffiliateConfig({
      ...affiliateConfig,
      storeUrl: affiliateUrl.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
    });

    onUpdateRestaurant({
      ...currentRestaurant,
      bkashNumber1: bkash1.trim(),
      bkashNumber2: bkash2.trim(),
      nagadNumber: nagad.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full p-5 border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                অ্যাডমিন কন্ট্রোল প্যানেল
              </h3>
              <p className="text-[11px] text-stone-500">
                {adminAuth.isAuthenticated
                  ? 'লগইন আছেন: SP TUPRHASAN (সুপার অ্যাডমিন)'
                  : 'সুরক্ষিত অ্যাডমিন লগইন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!adminAuth.isAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-900 dark:text-amber-300 font-medium">
                  🔒 অ্যাডমিন অ্যাক্সেসের জন্য ইউজার আইডি ও পাসওয়ার্ড প্রবেশ করান।
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  ID: <code className="font-bold">SP TUPRHASAN</code> | Password: <code className="font-bold">Bangla220921</code>
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg font-semibold text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  অ্যাডমিন ইউজার আইডি (Admin ID):
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="SP TUPRHASAN"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  পাসওয়ার্ড (Password):
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
              >
                লগইন করুন
              </button>
            </form>
          ) : (
            /* Logged in Admin Settings Dashboard */
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    স্বাগতম, SP TUPRHASAN
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    অ্যাডমিন মোড সক্রিয় রয়েছে। সমস্ত গোপনীয় সেটিংস পরিবর্তনযোগ্য।
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  লগআউট
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs border-b pb-1">
                  পেমেন্ট নম্বর ও অ্যাফিলিয়েট শপ কনফিগারেশন:
                </h4>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">
                    অ্যাফিলিয়েট স্টোর / ওয়েবসাইট লিংক:
                  </label>
                  <input
                    type="url"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1">
                      বিকাশ নম্বর ১ (bKash 1):
                    </label>
                    <input
                      type="text"
                      value={bkash1}
                      onChange={(e) => setBkash1(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1">
                      বিকাশ নম্বর ২ (bKash 2):
                    </label>
                    <input
                      type="text"
                      value={bkash2}
                      onChange={(e) => setBkash2(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1">
                      নগদ নম্বর (Nagad):
                    </label>
                    <input
                      type="text"
                      value={nagad}
                      onChange={(e) => setNagad(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1">
                      যোগাযোগ WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">
                    অফিসিয়াল ইমেইল (Email):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono text-[11px]"
                  />
                </div>

                {savedSuccess && (
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded text-center font-bold text-xs flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> সেটিংস সফলভাবে আপডেট হয়েছে!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm transition"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
