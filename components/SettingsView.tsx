'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Settings,
  User,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Database,
  CheckCircle2,
  Code2,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, resetAllDataToDefault, projects, tasks, sessions, history, environments } = useStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExportFullState = () => {
    const fullState = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      sessions,
      environments,
      history,
    };

    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codex-martis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Tem certeza de que deseja restaurar todos os dados para o estado inicial demonstrativo? Todas as alterações serão substituídas pelos dados oficiais da missão.')) {
      resetAllDataToDefault();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
          CONFIGURAÇÕES
          <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
        </h1>
        <p className="text-xs text-[#808088] mt-1 font-mono-code">
          Parâmetros do sistema, perfil do operador e gerenciamento de dados do Codex.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4 hud-card-corners">
        <h2 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" />
          PERFIL DO OPERADOR
        </h2>

        <div className="flex items-center gap-4 pt-2">
          <div className="w-14 h-14 rounded-xl bg-[#1A0A08] border border-[#E84A32]/60 flex items-center justify-center text-xl font-bold font-heading text-[#F2F2F3] shadow-[0_0_15px_rgba(232,74,50,0.3)]">
            {currentUser?.avatarInitials || 'MA'}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F2F2F3]">{currentUser?.name}</h3>
            <p className="text-xs text-[#808088] font-mono-code">{currentUser?.email}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#181820] text-emerald-400 font-bold">
              OPERADOR PRINCIPAL (ADMIN)
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Data Storage */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4" />
          GERENCIAMENTO DE DADOS & BACKUP
        </h2>
        <p className="text-xs text-[#808088]">
          Os dados do Codex Martis estão armazenados com persistência ativa no seu navegador. Você pode exportar uma cópia completa em JSON ou restaurar os dados modelo.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportFullState}
            className="px-4 py-2.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] hover:text-white text-xs font-bold font-heading flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#E84A32]" />
            <span>EXPORTAR BACKUP COMPLETO (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 rounded-lg bg-[#141418] hover:bg-red-950/30 border border-[#282832] hover:border-red-800 text-[#D8D8DC] hover:text-red-300 text-xs font-bold font-heading flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESTAURAR DADOS PADRÃO DA MISSÃO</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Dados demonstrativos restaurados com sucesso!</span>
          </div>
        )}
      </div>

      {/* System Specifications */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-3">
        <h2 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          ESPECIFICAÇÕES DO SISTEMA
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono-code">
          <div className="p-3 rounded bg-[#101014] border border-[#1A1A20]">
            <span className="text-[#66666D] block text-[10px]">Versão:</span>
            <span className="text-[#F2F2F3] font-bold">1.0.0</span>
          </div>
          <div className="p-3 rounded bg-[#101014] border border-[#1A1A20]">
            <span className="text-[#66666D] block text-[10px]">Schema Prompt:</span>
            <span className="text-[#E84A32] font-bold">1.0</span>
          </div>
          <div className="p-3 rounded bg-[#101014] border border-[#1A1A20]">
            <span className="text-[#66666D] block text-[10px]">Engine:</span>
            <span className="text-[#F2F2F3]">Next.js 15 App Router</span>
          </div>
          <div className="p-3 rounded bg-[#101014] border border-[#1A1A20]">
            <span className="text-[#66666D] block text-[10px]">Tema:</span>
            <span className="text-[#F2F2F3]">Martian HUD Dark</span>
          </div>
        </div>
      </div>
    </div>
  );
};
