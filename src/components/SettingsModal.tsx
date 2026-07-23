import React from 'react';

export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onUpdateSettings: (newSettings: any) => void;
  onExportData?: () => void;
  onImportData?: () => void;
}> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-4 text-sm">
          <label className="flex items-center justify-between">
            <span>Dikey Sekmeler (Vertical Tabs)</span>
            <input
              type="checkbox"
              checked={settings.useVerticalTabs || false}
              onChange={(e) => onUpdateSettings({ ...settings, useVerticalTabs: e.target.checked })}
              className="w-4 h-4 accent-blue-600"
            />
          </label>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Close</button>
      </div>
    </div>
  );
};

export interface UserSettings {
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'ecosia';
  theme: 'light' | 'dark' | 'system';
  privacyShield: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  httpsOnly: boolean;
  useVerticalTabs: boolean;
  showBookmarksBar: boolean;
}
