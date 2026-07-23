import React from 'react';

export const NewTabPage: React.FC<{ onNavigate: (url: string) => void; searchEngine?: string }> = ({ onNavigate }) => {
  const [q, setQ] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900 px-4">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
        Kenar Browser
      </h1>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`); }} className="w-full max-w-md">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search or enter URL..."
          className="w-full py-3 px-5 rounded-full border dark:border-slate-700 shadow-md bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
};
import { useState } from 'react';
