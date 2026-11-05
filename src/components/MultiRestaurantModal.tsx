import React, { useState } from 'react';
import { Restaurant } from '../types';
import { toBn } from '../utils/numberConverter';
import { Store, Plus, Check, Edit2, X } from 'lucide-react';

interface MultiRestaurantModalProps {
  restaurants: Restaurant[];
  currentRestaurantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectRestaurant: (id: string) => void;
  onAddRestaurant: (restaurant: Restaurant) => void;
  onUpdateRestaurant: (restaurant: Restaurant) => void;
}

export const MultiRestaurantModal: React.FC<MultiRestaurantModalProps> = ({
  restaurants,
  currentRestaurantId,
  isOpen,
  onClose,
  onSelectRestaurant,
  onAddRestaurant,
  onUpdateRestaurant,
}) => {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVatBin, setFormVatBin] = useState('');
  const [formVatPercent, setFormVatPercent] = useState('5');
  const [formFooter, setFormFooter] = useState('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingRestaurant(null);
    setFormName('');
    setFormBranch('');
    setFormAddress('');
    setFormPhone('');
    setFormVatBin('');
    setFormVatPercent('5');
    setFormFooter('আমাদের এখানে দেশি ও ঘরোয়া পরিবেশে সুস্বাদু খাবার পরিবেশন করা হয়। ধন্যবাদ!');
    setIsAddingNew(true);
  };

  const handleStartEdit = (r: Restaurant) => {
    setIsAddingNew(false);
    setEditingRestaurant(r);
    setFormName(r.name);
    setFormBranch(r.branch);
    setFormAddress(r.address);
    setFormPhone(r.phone);
    setFormVatBin(r.vatBin || '');
    setFormVatPercent(r.vatPercent.toString());
    setFormFooter(r.receiptFooter);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (isAddingNew) {
      const newRest: Restaurant = {
        id: `rest-${Date.now()}`,
        name: formName.trim(),
        branch: formBranch.trim() || 'শাখা',
        address: formAddress.trim(),
        phone: formPhone.trim(),
        vatBin: formVatBin.trim() || undefined,
        vatPercent: parseFloat(formVatPercent) || 0,
        serviceChargePercent: 0,
        currency: '৳',
        currencyType: 'BDT',
        receiptFooter: formFooter.trim() || 'ধন্যবাদ, আবার আসবেন!',
        bkashNumber1: '০১৫৫৮৪৫২৯২৯',
        bkashNumber2: '০১৮১৭২২০৯২১',
        nagadNumber: formPhone.trim(),
      };
      onAddRestaurant(newRest);
      onSelectRestaurant(newRest.id);
      setIsAddingNew(false);
    } else if (editingRestaurant) {
      const updated: Restaurant = {
        ...editingRestaurant,
        name: formName.trim(),
        branch: formBranch.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        vatBin: formVatBin.trim() || undefined,
        vatPercent: parseFloat(formVatPercent) || 0,
        receiptFooter: formFooter.trim(),
      };
      onUpdateRestaurant(updated);
      setEditingRestaurant(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              একাধিক রেস্টুরেন্ট ও শাখা পরিচালনা
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isAddingNew || editingRestaurant ? (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                {isAddingNew ? 'নতুন রেস্টুরেন্ট বা শাখা তৈরি' : 'রেস্টুরেন্টের তথ্য সম্পাদনা'}
              </h4>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  রেস্টুরেন্টের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: ঘরোয়া বাংলা হোটেল"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    শাখা / ব্রাঞ্চ:
                  </label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="যেমন: মিরপুর ১০ শাখা"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
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
                    placeholder="০১৭১১-০০০০০০"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  ঠিকানা:
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="দোকান বা হোটেলের অবস্থান"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    ভ্যাট রেজি / BIN (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={formVatBin}
                    onChange={(e) => setFormVatBin(e.target.value)}
                    placeholder="BIN-00000000"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    ভ্যাট হার % (VAT Rate):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formVatPercent}
                    onChange={(e) => setFormVatPercent(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  ক্যাশ মেমোর নিচের শুভেচ্ছা বার্তা:
                </label>
                <textarea
                  rows={2}
                  value={formFooter}
                  onChange={(e) => setFormFooter(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingRestaurant(null);
                  }}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-stone-500">
                  যে রেস্টুরেন্টে ক্লিক করবেন, সফটওয়্যারে সেটির ডাটা সক্রিয় হবে:
                </p>
                <button
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন রেস্টুরেন্ট
                </button>
              </div>

              {restaurants.map((rest) => {
                const isCurrent = rest.id === currentRestaurantId;
                return (
                  <div
                    key={rest.id}
                    onClick={() => {
                      onSelectRestaurant(rest.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-500/20'
                        : 'bg-white dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {rest.name}
                        </h4>
                        {isCurrent && (
                          <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {rest.branch} | ফোন: {rest.phone}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{rest.address}</p>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartEdit(rest)}
                        className="p-2 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="রেস্টুরেন্ট সেটিংস পরিবর্তন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
