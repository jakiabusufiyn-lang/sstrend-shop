import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { HomepageContent } from '../types';

interface Props {
  content?: HomepageContent['announcementBar'];
  onNavigate: (path: string) => void;
}

export const AnnouncementBar: React.FC<Props> = ({ content, onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !content?.enabled) return null;

  return (
    <div className="bg-[#1C1917] text-[#FAF7F5] px-4 py-2 text-xs md:text-sm tracking-wide relative flex items-center justify-center transition-all border-b border-[#2D2A26]">
      <div
        onClick={() => content.link && onNavigate(content.link)}
        className="flex items-center gap-2 text-center cursor-pointer hover:text-[#EAD7D1] transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
        <span className="font-normal font-sans">{content.text}</span>
        {content.link && (
          <span className="inline-flex items-center text-[#C5A059] font-medium text-xs underline underline-offset-2 ml-1">
            Shop Deals <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded-full transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
