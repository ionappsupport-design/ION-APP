import React, { useState, useEffect } from 'react';
import { subscribeToBannerConfig } from '../services/firebase';

interface BottomBannerAdProps {
  isPro: boolean;
}

export const BottomBannerAd: React.FC<BottomBannerAdProps> = ({
  isPro,
}) => {
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [bannerLinkUrl, setBannerLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToBannerConfig((data) => {
      setBannerImageUrl(data.imageUrl);
      setBannerLinkUrl(data.linkUrl);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-center items-center">
      {bannerImageUrl ? (
        <a 
          href={bannerLinkUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full flex justify-center items-center"
        >
          <img 
            src={bannerImageUrl} 
            alt="Advertisement" 
            className="w-full h-16 sm:h-20 object-cover rounded-xl shadow-sm border border-slate-200 dark:border-slate-800" 
          />
        </a>
      ) : (
        <div className="w-full text-center py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl shadow-lg border border-white/20 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-white/10 opacity-50 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
           <span className="relative z-10 text-white font-black text-xs sm:text-sm uppercase tracking-widest drop-shadow-md">
             *Your company's Advertisement Space^*
           </span>
        </div>
      )}
    </div>
  );
};
