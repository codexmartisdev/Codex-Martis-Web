'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useStore } from '@/lib/store';
import {
  Search,
  Bell,
  LogOut,
  Settings,
  RotateCcw,
  Download,
  Clock,
  ChevronDown,
  Database,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenCommandPalette?: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenProject?: (projectId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenCommandPalette,
  onNavigateTab,
}) => {
  const triggerSearch = onOpenCommandPalette || onOpenSearch || (() => {});
  const reduceMotion = useReducedMotion();
  const {
    currentUser,
    logout,
    activeSession,
    resetToInitialSeed,
    exportDatabaseJson,
    history,
    isFirestoreConnected,
    isFirestoreSyncing,
    syncDataToFirestore,
  } = useStore();
  const [currentDateTime, setCurrentDateTime] = useState<string>('01 de set. de 2026 • 08:45');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentDateTime(`${day} de ${month} de ${year} • ${hours}:${mins}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const popoverMotion = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.985 },
    transition: { duration: reduceMotion ? 0 : 0.17, ease: [0.22, 1, 0.36, 1] as const },
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codex-martis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowProfileMenu(false);
  };

  const handleReset = () => {
    if (confirm('Tem certeza de que deseja restaurar os dados de demonstração iniciais?')) {
      resetToInitialSeed();
      setShowProfileMenu(false);
    }
  };

  return (
    <header className="h-16 border-b border-[#232328] bg-[#070709]/82 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 relative overflow-visible">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E84A32]/20 to-transparent pointer-events-none" />

      {/* Left: Datetime cockpit display */}
      <div className="flex items-center gap-3 text-sm text-[#A0A0A7] relative z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#101014]/90 border border-[#232328] text-xs font-mono-code text-[#C5C5CB] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <Clock className="w-3.5 h-3.5 text-[#E84A32]" />
          <span>{currentDateTime}</span>
        </div>

        {/* Firestore Cloud Persistence Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono-code transition-colors ${
            isFirestoreConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
          title={isFirestoreConnected ? 'Cloud Firestore conectado e sincronizado em tempo real' : 'Conectando ao Cloud Firestore...'}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {isFirestoreSyncing ? 'Sincronizando...' : isFirestoreConnected ? 'Firestore Conectado' : 'Firestore Conectando...'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isFirestoreSyncing
                ? 'bg-amber-400 animate-ping'
                : isFirestoreConnected
                ? 'bg-emerald-400'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
        </div>

        {/* Live Active Session Indicator Pill */}
        {activeSession && (
          <button
            onClick={() => onNavigateTab('sessoes')}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E84A32]/10 border border-[#E84A32]/40 text-[#FF7A59] text-xs font-medium hover:bg-[#E84A32]/16 hover:border-[#E84A32]/65 mars-interactive"
          >
            <span className="relative flex w-2 h-2 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-[#E84A32]/70"
                animate={reduceMotion ? undefined : { scale: [1, 2.1], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative w-2 h-2 rounded-full bg-[#E84A32] shadow-[0_0_8px_rgba(232,74,50,0.85)]" />
            </span>
            <span>Sessão #{activeSession.sessionNumber.toString().padStart(3, '0')} ativa</span>
          </button>
        )}
      </div>

      {/* Center: Search input triggering Command Palette */}
      <div className="w-full max-w-md mx-4 relative z-10">
        <button
          onClick={triggerSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#0E0E12]/92 border border-[#232328] hover:border-[#E84A32]/35 text-[#66666D] hover:text-[#A0A0A7] text-sm shadow-inner group mars-interactive"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#A0A0A7] group-hover:text-[#E84A32] transition-colors duration-200" />
            <span className="text-xs text-[#808088] group-hover:text-[#9A9AA2] transition-colors">Buscar projetos, tarefas, sessões, ambientes...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono-code bg-[#18181D] text-[#A0A0A7] border border-[#28282D] rounded">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications & Profile Menu */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg bg-[#0E0E12] border border-[#232328] text-[#A0A0A7] hover:text-[#F2F2F3] hover:border-[#E84A32]/35 mars-interactive"
            title="Atividades e Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E84A32] shadow-[0_0_7px_rgba(232,74,50,0.7)]" />
          </button>

          <AnimatePresence>
            {showNotifMenu && (
              <motion.div
                {...popoverMotion}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 mt-2 w-80 rounded-lg bg-[#0F0F13]/98 backdrop-blur-xl border border-[#28282D] shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_28px_rgba(232,74,50,0.06)] p-3 z-50"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232328]">
                  <span className="text-xs font-semibold text-[#F2F2F3] uppercase tracking-wider font-heading">
                    Atividades Recentes
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#E84A32]/20 text-[#E84A32] rounded font-mono-code">
                    {history.slice(0, 4).length} novas
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {history.slice(0, 4).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2 rounded bg-[#141418] border border-[#1F1F24] hover:border-[#E84A32]/30 text-xs mars-interactive"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#A0A0A7] mb-1">
                        <span className="font-semibold text-[#E84A32]">{evt.projectName || 'Codex'}</span>
                        <span>{evt.timestamp}</span>
                      </div>
                      <p className="text-[#D8D8DC] font-medium leading-tight">{evt.title}</p>
                      <p className="text-[#888892] text-[11px] line-clamp-1 mt-0.5">{evt.description}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    onNavigateTab('historico');
                  }}
                  className="w-full mt-2.5 pt-2 border-t border-[#232328] text-center text-xs text-[#E84A32] hover:text-[#FF7A59] font-medium transition-colors"
                >
                  Ver histórico completo →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg bg-[#0E0E12] border border-[#232328] hover:border-[#E84A32]/35 group mars-interactive"
          >
            <div className="w-7 h-7 rounded-md bg-[#7D1A12]/40 border border-[#E84A32]/60 text-[#F2F2F3] flex items-center justify-center text-xs font-bold font-heading shadow-[0_0_10px_-4px_rgba(232,74,50,0.65)]">
              {currentUser?.avatarInitials || 'MA'}
            </div>
            <span className="text-xs font-medium text-[#D8D8DC] group-hover:text-white hidden md:inline-block transition-colors">
              {currentUser?.name || 'Marco'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#66666D] transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-[#E84A32]' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                {...popoverMotion}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0F0F13]/98 backdrop-blur-xl border border-[#28282D] shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_28px_rgba(232,74,50,0.06)] p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-[#232328] mb-1.5">
                  <p className="text-xs font-bold text-[#F2F2F3]">{currentUser?.name}</p>
                  <p className="text-[11px] text-[#808088] font-mono-code truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-[#E84A32]/15 text-[#E84A32] font-semibold">
                    {currentUser?.role || 'Comandante'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab('configuracoes');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#D8D8DC] hover:bg-[#18181D] hover:text-[#F2F2F3] rounded-md transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-[#A0A0A7]" />
                  <span>Configurações & Prompt</span>
                </button>

                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#D8D8DC] hover:bg-[#18181D] hover:text-[#F2F2F3] rounded-md transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-[#A0A0A7]" />
                  <span>Exportar Backup (JSON)</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors text-left"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Restaurar Dados Demo</span>
                </button>

                <button
                  onClick={() => {
                    syncDataToFirestore();
                    setShowProfileMenu(false);
                  }}
                  disabled={isFirestoreSyncing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors text-left disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isFirestoreSyncing ? 'animate-spin' : ''}`} />
                  <span>{isFirestoreSyncing ? 'Sincronizando...' : 'Sincronizar Cloud Firestore'}</span>
                </button>

                <div className="border-t border-[#232328] my-1.5" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#E84A32] hover:bg-[#E84A32]/10 rounded-md transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Sistema</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
