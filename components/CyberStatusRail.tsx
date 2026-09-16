'use client';

import React from 'react';
import { Activity, Database, Radio, ShieldCheck, SquareTerminal } from 'lucide-react';
import { useStore } from '@/lib/store';

export const CyberStatusRail: React.FC = () => {
  const {
    projects,
    tasks,
    activeSession,
    isFirestoreConnected,
    isFirestoreSyncing,
  } = useStore();

  const openTasks = tasks.filter((task) => task.status !== 'Concluída' && task.status !== 'Cancelada').length;

  return (
    <div className="hidden md:flex fixed bottom-0 left-64 right-0 z-40 h-8 items-center justify-between gap-4 px-4 border-t border-[#24242B] bg-[#060608]/92 backdrop-blur-xl font-mono-code text-[9px] tracking-wide select-none">
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex items-center gap-1.5 text-[#FF7A59] shrink-0">
          <SquareTerminal className="w-3 h-3" />
          MARS://CODEX-CORE
        </span>
        <span className="h-3 w-px bg-[#24242B]" />
        <span className="flex items-center gap-1.5 text-[#777781]">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SECURE CHANNEL
        </span>
        <span className="flex items-center gap-1.5 text-[#777781]">
          <Database className={`w-3 h-3 ${isFirestoreConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          {isFirestoreSyncing ? 'SYNCING' : isFirestoreConnected ? 'DATA LINK NOMINAL' : 'DATA LINK ACQUIRING'}
        </span>
        <span className="flex items-center gap-1.5 text-[#777781]">
          <Activity className="w-3 h-3 text-[#E84A32]" />
          {projects.length} NODES / {openTasks} OPEN OPS
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {activeSession ? (
          <span className="flex items-center gap-1.5 text-[#FF7A59]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#E84A32] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E84A32]" />
            </span>
            MISSION #{activeSession.sessionNumber.toString().padStart(3, '0')} ACTIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#62626B]">
            <Radio className="w-3 h-3" />
            MISSION CHANNEL STANDBY
          </span>
        )}
        <span className="px-1.5 py-0.5 rounded border border-[#2B2B33] text-[#5F5F68]">⌘K COMMAND</span>
      </div>
    </div>
  );
};
