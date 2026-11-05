import React, { useState, useMemo } from 'react';
import { MenuItem, FoodCategory } from '../types';
import { formatTaka, toBn } from '../utils/numberConverter';
import { Utensils, Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
}

const CATEGORIES: FoodCategory[] = [
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
  'অন্যান্য',
];

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব ক্যাটাগরি');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FoodCategory>('মেজবান স্পেশাল');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formUnit, setFormUnit] = useState('প্লেট');
  const [formAvailable, setFormAvailable] = useState(true);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat =
        selectedCategory === 'সব ক্যাটাগরি' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('মেজবান স্পেশাল');
    setFormSellingPrice('');
    setFormCostPrice('');
    setFormUnit('প্লেট');
    setFormAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category as FoodCategory);
    setFormSellingPrice(item.sellingPrice.toString());
    setFormCostPrice(item.costPrice.toString());
    setFormUnit(item.unit || 'প্লেট');
    setFormAvailable(item.available);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSellingPrice) return;

    const sp = parseFloat(formSellingPrice) || 0;
    const cp = parseFloat(formCostPrice) || Math.round(sp * 0.55);

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        sellingPrice: sp,
        costPrice: cp,
        unit: formUnit,
        available: formAvailable,
      });
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        sellingPrice: sp,
        costPrice: cp,
        unit: formUnit,
        available: formAvailable,
      };
      onAddMenuItem(newItem);
    }

    setIsModalOpen(false);
  };

  const toggleAvailability = (item: MenuItem) => {
    onUpdateMenuItem({
      ...item,
      available: !item.available,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            খাবারের মেনু ও মূল্য তালিকা
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            মোট আইটেম: {toBn(menuItems.length)} টি | প্রতিটি খাবারের বিক্রয়মূল্য ও লাভ হিসাব করুন
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          নতুন খাবার যোগ করুন
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('সব ক্যাটাগরি')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'সব ক্যাটাগরি'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            সব ক্যাটাগরি ({toBn(menuItems.length)})
          </button>
          {CATEGORIES.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {cat} ({toBn(count)})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="খাবারের নাম দিয়ে সার্চ..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Food Items Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-3">খাবারের নাম</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3">পরিমাপ / একক</th>
                <th className="p-3 text-right">বিক্রয়মূল্য</th>
                <th className="p-3 text-right">ক্রয়মূল্য / খরচ</th>
                <th className="p-3 text-right">মুনাফা (লাভ)</th>
                <th className="p-3 text-center">স্টক স্ট্যাটাস</th>
                <th className="p-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredItems.map((item) => {
                const profitPerItem = item.sellingPrice - item.costPrice;
                const profitPercent =
                  item.sellingPrice > 0 ? Math.round((profitPerItem / item.sellingPrice) * 100) : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500">{item.unit || 'প্লেট'}</td>
                    <td className="p-3 text-right font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {formatTaka(item.sellingPrice)}
                    </td>
                    <td className="p-3 text-right text-stone-500 tabular-nums">
                      {formatTaka(item.costPrice)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatTaka(profitPerItem)}{' '}
                      <span className="text-[10px] text-emerald-500 font-normal">
                        ({toBn(profitPercent)}%)
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {item.available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            সহজলভ্য
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-400" />
                            স্টক শেষ
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-stone-500 hover:text-amber-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${item.name}" খাবারটি তালিকা থেকে মুছে ফেলতে চান?`)) {
                              onDeleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-5 border border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              {editingItem ? 'খাবারের তথ্য পরিবর্তন করুন' : 'নতুন খাবার যোগ করুন'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  খাবারের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: পদ্মার ইলিশ ভাজি"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    ক্যাটাগরি:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FoodCategory)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    একক (Unit):
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                  >
                    <option value="প্লেট">প্লেট</option>
                    <option value="বাটি">বাটি</option>
                    <option value="পিস">পিস</option>
                    <option value="গ্লাস">গ্লাস</option>
                    <option value="কাপ">কাপ</option>
                    <option value="হাফ">হাফ</option>
                    <option value="ফুল">ফুল</option>
                    <option value="বোতল">বোতল</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    বিক্রয়মূল্য (৳):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    placeholder="১২০"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    কাঁচামাল খরচ (৳):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="৭০"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-bold tabular-nums"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  খাবারটি বর্তমানে সহজলভ্য আছে (মেনুতে দেখাবে)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {editingItem ? 'আপডেট করুন' : 'মেনুতে যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
