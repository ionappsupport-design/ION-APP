import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminBannerScreenProps {
  onBack: () => void;
}

export const AdminBannerScreen: React.FC<AdminBannerScreenProps> = ({ onBack }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    setImageUrl(localStorage.getItem('custom_banner_image_url') || '');
    setLinkUrl(localStorage.getItem('custom_banner_link_url') || '');
  }, []);

  const handleSave = () => {
    if (imageUrl) {
      localStorage.setItem('custom_banner_image_url', imageUrl);
    } else {
      localStorage.removeItem('custom_banner_image_url');
    }
    
    if (linkUrl) {
      localStorage.setItem('custom_banner_link_url', linkUrl);
    } else {
      localStorage.removeItem('custom_banner_link_url');
    }
    
    window.dispatchEvent(new Event('banner_updated'));
    toast.success('Banner Settings Saved');
  };

  const handleClear = () => {
    setImageUrl('');
    setLinkUrl('');
    localStorage.removeItem('custom_banner_image_url');
    localStorage.removeItem('custom_banner_link_url');
    window.dispatchEvent(new Event('banner_updated'));
    toast.success('Banner Cleared');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Admin Panel
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Manage Ad Banner</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Banner Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Banner Image URL
              </label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.png"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Link URL (Optional)
              </label>
              <input 
                type="text" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button 
                onClick={handleClear}
                className="py-2.5 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm">Live Preview</h2>
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 min-h-[80px] p-2">
            {imageUrl ? (
              <img src={imageUrl} alt="Banner Preview" className="max-w-full max-h-24 object-contain" />
            ) : (
              <div className="w-full text-center py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl shadow-lg border border-white/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-white/10 opacity-50 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                 <span className="relative z-10 text-white font-black text-[11px] uppercase tracking-widest drop-shadow-md">
                   *Your company's Advertisement Space^*
                 </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
