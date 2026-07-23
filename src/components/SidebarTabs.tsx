import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, Globe, VolumeX, X, Briefcase, User, Folder } from 'lucide-react';
import { Tab, Workspace } from '../types/browser';

interface SidebarTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: (url?: string) => void;
  onToggleMuteTab: (id: string, e: React.MouseEvent) => void;
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  isIncognito?: boolean;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onToggleMuteTab,
  workspaces = [],
  activeWorkspaceId,
  onSelectWorkspace,
  isIncognito = false,
}) => {
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <aside className={`group relative flex flex-col h-full z-30 transition-all duration-300 select-none border-r ${
      isIncognito
        ? 'bg-slate-900 border-slate-800 text-slate-200'
        : 'bg-slate-100/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
    } w-14 hover:w-64 shadow-xl`}>
      {/* Workspace Header */}
      {activeWorkspace && (
        <div className="p-2 border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-800 transition-colors">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-workspace-manager'))}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
            title={`Workspace: ${activeWorkspace.name}`}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{
                backgroundColor:
                  activeWorkspace.color === 'slate' ? '#64748b' :
                  activeWorkspace.color === 'blue' ? '#3b82f6' :
                  activeWorkspace.color === 'emerald' ? '#10b981' :
                  activeWorkspace.color === 'amber' ? '#f59e0b' : '#a855f7'
              }}
            >
              {activeWorkspace.name.charAt(0)}
            </div>
            <span className="font-semibold text-sm truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {activeWorkspace.name}
            </span>
          </button>
        </div>
      )}

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <motion.div
              layout
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center h-10 px-2 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? isIncognito
                    ? 'bg-slate-800 text-white font-medium shadow-xs border border-slate-700'
                    : 'bg-white text-blue-600 font-medium shadow-xs border border-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'
                  : isIncognito
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 px-2 flex-1 min-w-0">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {tab.isLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-500/50 border-t-transparent rounded-full animate-spin" />
                  ) : tab.favicon ? (
                    <img src={tab.favicon} alt="" className="w-4 h-4 rounded-sm" />
                  ) : (
                    <Globe className="w-4 h-4 opacity-70" />
                  )}
                </div>

                <span className="text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {tab.title || tab.url || 'New Tab'}
                </span>
              </div>

              {/* Action Buttons (Visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id, e);
                    }}
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Close Tab"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer / New Tab */}
      <div className="p-2 border-t border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50 transition-colors">
        <button
          onClick={() => onNewTab()}
          className={`flex items-center gap-3 w-full h-10 px-2 rounded-lg transition-colors ${
            isIncognito
              ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          }`}
          title="New Tab"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            New Tab
          </span>
        </button>
      </div>
    </aside>
  );
};
