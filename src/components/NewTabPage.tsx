import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ShieldCheck, ShieldAlert, Plus, X, Edit2, Globe } from 'lucide-react';
import { formatSearchUrl, getSearchEngineName } from '../utils/searchEngine';
import { UserSettings } from './SettingsModal';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  searchEngine?: UserSettings['searchEngine'];
  privacyShield?: boolean;
}

const DEFAULT_SPEED_DIALS = [
  { name: 'Google', url: 'https://www.google.com', domain: 'google.com' },
  { name: 'GitHub', url: 'https://github.com', domain: 'github.com' },
  { name: 'YouTube', url: 'https://www.youtube.com', domain: 'youtube.com' },
  { name: 'Reddit', url: 'https://www.reddit.com', domain: 'reddit.com' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', domain: 'wikipedia.org' },
];

// Floating particle component
const Particle: React.FC<{ delay: number; x: number; size: number; duration: number }> = ({ delay, x, size, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      bottom: '-20px',
      background: `radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)`,
    }}
    animate={{ y: [0, -600], opacity: [0, 0.6, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  />
);

export const NewTabPage: React.FC<NewTabPageProps> = React.memo(({
  onNavigate,
  searchEngine = 'google',
  privacyShield = true
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [speedDials, setSpeedDials] = useState<typeof DEFAULT_SPEED_DIALS>(() => {
    try {
      const saved = localStorage.getItem('nova_speed_dials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SPEED_DIALS;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDial, setEditingDial] = useState<{ name: string; url: string; index: number | null }>({ name: '', url: '', index: null });

  useEffect(() => {
    localStorage.setItem('nova_speed_dials', JSON.stringify(speedDials));
  }, [speedDials]);

  const handleDeleteDial = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSpeedDials(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditDial = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingDial({ ...speedDials[index], index });
    setIsEditModalOpen(true);
  };

  const handleAddDial = () => {
    setEditingDial({ name: '', url: '', index: null });
    setIsEditModalOpen(true);
  };

  const handleSaveDial = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalUrl = editingDial.url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      const urlObj = new URL(finalUrl);
      const newDial = { name: editingDial.name, url: finalUrl, domain: urlObj.hostname };
      setSpeedDials(prev => {
        const next = [...prev];
        if (editingDial.index !== null) next[editingDial.index] = newDial;
        else next.push(newDial);
        return next;
      });
      setIsEditModalOpen(false);
    } catch {
      alert('Lütfen geçerli bir URL girin.');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }));
      const h = now.getHours();
      if (h < 5) setGreeting('İyi geceler');
      else if (h < 12) setGreeting('Günaydın');
      else if (h < 18) setGreeting('İyi öğleden sonralar');
      else setGreeting('İyi akşamlar');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    onNavigate(formatSearchUrl(searchValue, searchEngine));
  };

  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 1.5,
    x: (i * 8 + Math.sin(i) * 5) % 100,
    size: 4 + (i % 3) * 4,
    duration: 8 + (i % 4) * 2,
  }));

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 30%, #302b63 60%, #24243e 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6"
      >
        {/* Privacy badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 ${
            privacyShield
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}
        >
          {privacyShield
            ? <ShieldCheck className="w-3.5 h-3.5" />
            : <ShieldAlert className="w-3.5 h-3.5" />}
          {privacyShield ? 'Privacy Shield Aktif' : 'Privacy Shield Devre Dışı'}
        </motion.div>

        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8 select-none"
        >
          <div className="text-8xl font-thin text-white tracking-tight tabular-nums" style={{ fontFamily: 'system-ui, sans-serif', textShadow: '0 0 60px rgba(139,92,246,0.3)' }}>
            {timeStr}
          </div>
          <div className="text-slate-400 text-sm mt-2 font-medium capitalize tracking-wide">{dateStr}</div>
          <div className="text-indigo-300 text-base mt-1 font-medium">{greeting}</div>
        </motion.div>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="w-full relative mb-10"
        >
          <div className={`relative rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.5),0_8px_40px_rgba(99,102,241,0.2)]'
              : 'shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
          }`}
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFocused ? 'text-indigo-400' : 'text-slate-400'}`} />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`${getSearchEngineName(searchEngine)} ile ara veya URL gir...`}
              className="w-full bg-transparent text-white placeholder-slate-400 py-4 pl-12 pr-14 text-base outline-none rounded-2xl"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all active:scale-95 shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        {/* Speed Dials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Hızlı Erişim</p>
          <div className="grid grid-cols-6 gap-3">
            {speedDials.map((dial, idx) => (
              <div key={idx} className="relative group">
                <button
                  onClick={() => onNavigate(dial.url)}
                  className="w-full flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${dial.domain}&sz=64`}
                      alt={dial.name}
                      className="w-6 h-6 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 truncate w-full text-center font-medium">{dial.name}</span>
                </button>
                {/* Edit actions */}
                <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={e => handleEditDial(e, idx)} className="p-1 bg-indigo-500 text-white rounded-full shadow hover:bg-indigo-600 transition-colors">
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button onClick={e => handleDeleteDial(e, idx)} className="p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add button */}
            <button
              onClick={handleAddDial}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Ekle</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-96 rounded-2xl p-6 shadow-2xl"
              style={{ background: 'rgba(30,27,75,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-5">
                {editingDial.index !== null ? 'Kısayolu Düzenle' : 'Kısayol Ekle'}
              </h3>
              <form onSubmit={handleSaveDial} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">İsim</label>
                  <input
                    type="text"
                    value={editingDial.name}
                    onChange={e => setEditingDial(p => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">URL</label>
                  <input
                    type="text"
                    value={editingDial.url}
                    onChange={e => setEditingDial(p => ({ ...p, url: e.target.value }))}
                    required
                    placeholder="https://example.com"
                    className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >İptal</button>
                  <button type="submit"
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >Kaydet</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
