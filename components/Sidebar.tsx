'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, selectedProjectId, setSelectedProjectId } = useStore();
  const reduceMotion = useReducedMotion();

  const navItems = [
    { id: 'command', label: 'COMMAND', icon: LayoutDashboard },
    { id: 'projetos', label: 'PROJETOS', icon: FolderKanban },
    { id: 'tarefas', label: 'TAREFAS', icon: CheckSquare },
    { id: 'sessoes', label: 'SESSÕES', icon: PlayCircle },
    { id: 'historico', label: 'HISTÓRICO', icon: History },
    { id: 'ambientes', label: 'AMBIENTES', icon: Server },
  ];

  const indicatorTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 430, damping: 34, mass: 0.55 };

  const handleNavClick = (tabId: string) => {
    if (tabId === 'projetos') {
      setSelectedProjectId(null);
    }
    onSelectTab(tabId);
  };

  const renderActiveSurface = () => (
    <>
      <motion.span
        layoutId="codex-sidebar-active-surface"
        className="absolute inset-0 rounded-lg bg-[#140806] border border-[#E84A32]/60 shadow-[0_0_22px_-4px_rgba(232,74,50,0.28)]"
        transition={indicatorTransition}
      />
      <motion.span
        layoutId="codex-sidebar-active-rail"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#E84A32] rounded-r-full shadow-[0_0_10px_rgba(232,74,50,0.95)]"
        transition={indicatorTransition}
      />
    </>
  );

  return (
    <aside className="w-64 bg-[#070709]/95 backdrop-blur-xl border-r border-[#232328] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#E84A32]/15 to-transparent pointer-events-none" />

      {/* Top Header with authentic Logo */}
      <div className="relative z-10">
        <div className="p-6 pb-6 border-b border-[#18181D] flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-x-8 -top-10 h-20 bg-[#E84A32]/[0.05] blur-2xl pointer-events-none" />
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
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider font-heading group relative overflow-hidden border mars-interactive ${
                  isActive
                    ? 'text-[#F2F2F3] border-transparent'
                    : 'text-[#888892] hover:text-[#D8D8DC] hover:bg-[#0E0E12] border-transparent'
                }`}
              >
                {isActive && renderActiveSurface()}
                <Icon
                  className={`relative z-10 w-4 h-4 transition-all duration-200 ${
                    isActive
                      ? 'text-[#E84A32] drop-shadow-[0_0_6px_rgba(232,74,50,0.45)]'
                      : 'text-[#66666D] group-hover:text-[#A0A0A7] group-hover:translate-x-0.5'
                  }`}
                />
                <span className="relative z-10 uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area with Mars Horizon Curve & Settings & User Card */}
      <div className="relative z-10">
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-radial from-[#E84A32]/15 via-[#7D1A12]/5 to-transparent blur-xl pointer-events-none mars-atmosphere-pulse" />

        <div className="p-4 pt-2 border-t border-[#18181D] space-y-3 relative z-10">
          {/* Settings Button */}
          <button
            onClick={() => handleNavClick('configuracoes')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider font-heading relative overflow-hidden border mars-interactive ${
              currentTab === 'configuracoes'
                ? 'text-[#F2F2F3] border-transparent'
                : 'text-[#888892] hover:text-[#D8D8DC] hover:bg-[#0E0E12] border-transparent'
            }`}
          >
            {currentTab === 'configuracoes' && renderActiveSurface()}
            <Settings
              className={`relative z-10 w-4 h-4 transition-all duration-200 ${
                currentTab === 'configuracoes'
                  ? 'text-[#E84A32] drop-shadow-[0_0_6px_rgba(232,74,50,0.45)]'
                  : 'text-[#66666D]'
              }`}
            />
            <span className="relative z-10 uppercase">CONFIGURAÇÕES</span>
          </button>

          {/* User Status Bar */}
          <div className="p-2.5 rounded-lg bg-[#0C0C0E]/90 border border-[#1C1C22] flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-[#7D1A12]/50 border border-[#E84A32]/40 text-[#F2F2F3] flex items-center justify-center text-xs font-bold font-heading shrink-0 shadow-[0_0_12px_-4px_rgba(232,74,50,0.55)]">
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
            <span className="text-[10px] font-mono-code text-[#44444C] tracking-wide">
              Codex Martis • v1.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
