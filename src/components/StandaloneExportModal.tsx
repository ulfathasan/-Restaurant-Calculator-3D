import React, { useRef } from 'react';
import { AppState } from '../types';
import { generateStandaloneHTML, exportBackupJSON } from '../utils/storage';
import { Download, Upload, Globe, Laptop, Smartphone, CheckCircle, X, ShieldCheck, Server, Folder } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRestoreState: (state: AppState) => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadHTML = () => {
    generateStandaloneHTML(appState);
  };

  const handleDownloadBackup = () => {
    exportBackupJSON(appState);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.restaurants && parsed.menuItems) {
          onRestoreState(parsed);
          alert('আলহামদুলিল্লাহ! আপনার ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে।');
          onClose();
        } else {
          alert('ভুল ফাইল ফরম্যাট। অনুগ্রহ করে সঠিক রেস্টুরেন্ট ব্যাকআপ ফাইল সিলেক্ট করুন।');
        }
      } catch (err) {
        alert('ফাইল পড়তে সমস্যা হয়েছে। সঠিক JSON ব্যাকআপ ফাইল দিন।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-lg w-full p-5 border border-stone-200 dark:border-stone-800 max-h-[92vh] flex flex-col card-3d">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              অফলাইন সফটওয়্যার ও public_html হোস্টিং
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {/* Main Download Card */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="p-2 bg-amber-600 text-white rounded-xl shrink-0">
                <Download className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  একক ফাইল ডাউনলোড (restaurant-calculator.html)
                </h4>
                <p className="text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                  একটিমাত্র এইচটিএমএল ফাইলে ১১২+ খাবার, মেজবান মেনু, থার্মাল প্রিন্ট, bKash (০১৫৫৮৪৫২৯২৯ ও ০১৮১৭২২০৯২১), কিউআর কোড এবং ডার্ক থিম যুক্ত আছে। কোনো সার্ভার বা ইন্টারনেট লাগবে না।
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadHTML}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 btn-3d"
            >
              <Download className="w-4 h-4" />
              ডাউনলোড করুন এক ফাইলের অফলাইন সফটওয়্যার (.html)
            </button>
          </div>

          {/* public_html instructions */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-2xl space-y-2">
            <h5 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-amber-600" />
              ওয়েবসাইটের public_html ফোল্ডারে আপলোড করে ফ্রি শেয়ার:
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 leading-relaxed">
              <li>
                উপরের হলুদ বাটনটি চেপে <strong>restaurant-calculator.html</strong> ফাইলটি ডাউনলোড করুন।
              </li>
              <li>
                আপনার cPanel / Web Hosting এর <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded font-bold">public_html</code> ডিরেক্টরিতে ফাইলটি আপলোড করুন।
              </li>
              <li>
                আপনার ওয়েবসাইটের লিংক: <code className="text-amber-700 dark:text-amber-400 font-bold">yourdomain.com/restaurant-calculator.html</code> ভিজিট করলেই যে কেউ আজীবন ফ্রিতে ব্যবহার করতে পারবে!
              </li>
            </ol>
          </div>

          {/* Backup & Restore Data */}
          <div className="p-4 border border-stone-200 dark:border-stone-700 rounded-2xl space-y-2.5">
            <h5 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              হিসাবের ডাটা ব্যাকআপ ও পুনরুদ্ধার (Backup & Restore)
            </h5>
            <p className="text-stone-500">
              আপনার সমস্ত মেনু, দৈনিক বিক্রয় ও কাস্টমার বাকির হিসাব ব্যাকআপ রাখুন:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition border border-stone-300 dark:border-stone-700 btn-3d"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                ব্যাকআপ (.json)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition border border-stone-300 dark:border-stone-700 btn-3d"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                ব্যাকআপ রিস্টোর
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 rounded-xl font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
