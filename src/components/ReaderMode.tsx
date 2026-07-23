import React, { useState, useEffect } from 'react';
import { X, BookOpen, Type, Moon, Sun } from 'lucide-react';

interface ReaderModeProps {
  url: string;
  tabId: string;
  isActive: boolean;
  onClose: () => void;
}

export const ReaderMode: React.FC<ReaderModeProps> = ({
  url,
  isActive,
  onClose
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${
      theme === 'light' ? 'bg-white text-slate-900' :
      theme === 'sepia' ? 'bg-[#f8f1e5] text-[#433422]' :
      'bg-slate-950 text-slate-200'
    }`}>
      <div className="sticky top-0 flex items-center justify-between p-4 border-b backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold text-sm">Reader Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-1 rounded hover:bg-black/5">
            <Type className="w-4 h-4" />-
          </button>
          <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-1 rounded hover:bg-black/5">
            <Type className="w-5 h-5" />+
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-12 px-6" style={{ fontSize: `${fontSize}px` }}>
        <h1 className="text-3xl font-bold mb-4">Reader View Article</h1>
        <p className="leading-relaxed opacity-90">
          This is a distilled reader view of the webpage content, stripped of ads and distractions for optimal reading focus.
        </p>
      </div>
    </div>
  );
};
