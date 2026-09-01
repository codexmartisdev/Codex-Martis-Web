'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { CodexLogo } from './CodexLogo';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  PlayCircle,
  History,
  Server,
  Settings,
  Flame,
  ChevronUp,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, logout, selectedProjectId, setSelectedProjectId } = useStore();

  const navItems = [
    { id: 'command', label: 'COMMAND', icon: LayoutDashboard },
    { id: 'projetos', label: 'PROJETOS', icon: FolderKanban },
    { id: 'tarefas', label: 'TAREFAS', icon: CheckSquare },
    { id: 'sessoes', label: 'SESSÕES', icon: PlayCircle },
    { id: 'historico', label: 'HISTÓRICO', icon: History },
    { id: 'ambientes', label: 'AMBIENTES', icon: Server },
  ];

  const handleNavClick = (tabId: string) => {
    // If we're inside a project command center and user clicks on another tab or 'projetos', handle smoothly
    if (tabId === 'projetos') {
      setSelectedProjectId(null);
    }
    onSelectTab(tabId);
  };

  return (
    <aside className="w-64 bg-[#070709] border-r border-[#232328] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 overflow-hidden">
      {/* Top Header with authentic Logo */}
      <div>
        <div className="p-6 pb-6 border-b border-[#18181D] flex flex-col items-center">
          <CodexLogo size="lg" showText={true} />
        </div>

        {/* Main Navigation Menu */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id && (!selectedProjectId || item.id !== 'projetos');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-heading transition-all group relative ${
                  isActive
                    ? 'bg-[#140806] text-[#F2F2F3] border border-[#E84A32]/60 shadow-[0_0_20px_-3px_rgba(232,74,50,0.25)]'
                    : 'text-[#888892] hover:text-[#D8D8DC] hover:bg-[#0E0E12] border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#E84A32] rounded-r-full shadow-[0_0_8px_#E84A32]" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#E84A32]' : 'text-[#66666D] group-hover:text-[#A0A0A7]'
                  }`}
                />
                <span className="uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area with Mars Horizon Curve & Settings & User Card */}
      <div className="relative">
        {/* Subtle Decorative Mars horizon graphic in bottom corner */}
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-radial from-[#E84A32]/15 via-[#7D1A12]/5 to-transparent blur-xl pointer-events-none" />

        <div className="p-4 pt-2 border-t border-[#18181D] space-y-3 relative z-10">
          {/* Settings Button */}
          <button
            onClick={() => handleNavClick('configuracoes')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider font-heading transition-all ${
              currentTab === 'configuracoes'
                ? 'bg-[#140806] text-[#F2F2F3] border border-[#E84A32]/60'
                : 'text-[#888892] hover:text-[#D8D8DC] hover:bg-[#0E0E12]'
            }`}
          >
            <Settings
              className={`w-4 h-4 ${
                currentTab === 'configuracoes' ? 'text-[#E84A32]' : 'text-[#66666D]'
              }`}
            />
            <span className="uppercase">CONFIGURAÇÕES</span>
          </button>

          {/* User Status Bar */}
          <div className="p-2.5 rounded-lg bg-[#0C0C0E] border border-[#1C1C22] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-[#7D1A12]/50 border border-[#E84A32]/40 text-[#F2F2F3] flex items-center justify-center text-xs font-bold font-heading shrink-0">
                {currentUser?.avatarInitials || 'MA'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#F2F2F3] truncate leading-tight">
                  {currentUser?.name || 'Marco Aquino'}
                </p>
                <p className="text-[10px] text-[#66666D] font-mono-code truncate leading-tight mt-0.5">
                  {currentUser?.email || 'marcoa.aquino@gmail.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono-code text-[#44444C]">
              Codex Martis • v1.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
