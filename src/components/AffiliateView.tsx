import React from 'react';
import { AffiliateConfig, Restaurant } from '../types';
import {
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  Mail,
  ShieldCheck,
  Star,
  Award,
  Sparkles,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface AffiliateViewProps {
  affiliateConfig: AffiliateConfig;
  restaurant: Restaurant;
  onOpenAdminModal: () => void;
}

export const AffiliateView: React.FC<AffiliateViewProps> = ({
  affiliateConfig,
  restaurant,
  onOpenAdminModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Banner for Affiliate & External Products */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-600 via-amber-700 to-orange-700 text-white p-6 sm:p-8 shadow-xl card-3d">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> অফিসিয়াল পার্টনার ও অ্যাফিলিয়েট শপ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            রেস্টুরেন্ট ও কিচেনের সেরা পণ্য ও ডিল সংগ্রহ
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
            খাঁটি মশলা, রান্নার সরঞ্জাম, কিচেন এক্সেসরিজ এবং ব্যবসায়িক প্রচারণার জন্য আমাদের স্পেশাল অ্যাফিলিয়েট স্টোরে ভিজিট করুন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={affiliateConfig.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-amber-900 hover:bg-amber-50 rounded-xl font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition flex items-center gap-2 btn-3d"
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>ভিজিট করুন অ্যাফিলিয়েট শপ</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={`https://wa.me/8801817220921`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 btn-3d"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে অর্ডার</span>
            </a>
          </div>
        </div>
      </div>

      {/* Featured Affiliate Categories / Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs card-3d space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-lg">
            🍛
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            মেজবানি ও বিরিয়ানি স্পেশাল মশলা
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            চট্টগ্রামের ঐতিহ্যবাহী খাঁটি রাঁধুনী মেজবানি মশলা, কাচ্চি ও পোলাও মশলার প্যাকেট সরাসরি অর্ডার করুন।
          </p>
          <a
            href={affiliateConfig.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline"
          >
            অফার দেখুন <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs card-3d space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
            🖨️
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            থার্মাল POS প্রিন্টার ও পেপার রোল
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            ৮০মিমি ও ৫৮মিমি ব্লুটুথ ও ইউএসবি থার্মাল স্লিপ প্রিন্টার ও প্রিন্টিং পেপার রোল সুলভ মূল্যে সংগ্রহ করুন।
          </p>
          <a
            href={affiliateConfig.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
          >
            প্রিন্টার শপ দেখুন <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs card-3d space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-lg">
            🔪
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            প্রিমিয়াম শেফ নাইফ ও কিচেনওয়্যার
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            স্টেইনলেস স্টিল মাছ-মাংস কাটার ছুরি, কড়াই, ডেকচি এবং রেস্টুরেন্টের যাবতীয় ভারী কিচেন সামগ্রী।
          </p>
          <a
            href={affiliateConfig.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            সংগ্রহ ব্রাউজ করুন <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Official Contact Details Box */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-600" />
          সরাসরি যোগাযোগ ও কাস্টমার সাপোর্ট
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* WhatsApp */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <p className="text-stone-500 font-medium">হোয়াটসঅ্যাপ সাপোর্ট:</p>
                <p className="font-black text-sm text-stone-900 dark:text-stone-100 tabular-nums">
                  {affiliateConfig.whatsapp}
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/8801817220921"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
            >
              মেসেজ দিন
            </a>
          </div>

          {/* Email */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <p className="text-stone-500 font-medium">অফিসিয়াল ইমেইল:</p>
                <p className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                  {affiliateConfig.email}
                </p>
              </div>
            </div>
            <a
              href={`mailto:${affiliateConfig.email}`}
              className="px-3 py-1.5 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-lg font-bold"
            >
              মেইল পাঠান
            </a>
          </div>
        </div>

        {/* Admin Login shortcut */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            অ্যাফিলিয়েট লিংক বা যোগাযোগের তথ্য পরিবর্তন করতে অ্যাডমিন প্যানেলে লগইন করুন।
          </p>
          <button
            onClick={onOpenAdminModal}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> অ্যাডমিন লগইন (SP TUPRHASAN)
          </button>
        </div>
      </div>
    </div>
  );
};
