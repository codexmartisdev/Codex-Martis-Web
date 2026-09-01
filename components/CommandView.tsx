'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  FolderKanban,
  Code2,
  Rocket,
  Lock,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  Globe,
  Shield,
  Cog,
  FileCheck,
  Sparkles,
  Users,
} from 'lucide-react';

interface CommandViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenProject: (projectId: string) => void;
}

export const CommandView: React.FC<CommandViewProps> = ({
  onNavigateTab,
  onOpenProject,
}) => {
  const { projects, history, tasks, startSession, getProjectNextMissionTitle } = useStore();

  // Metrics calculation
  const totalActive = projects.filter((p) => p.status !== 'encerrado' && p.status !== 'pausado').length;
  const inDevelopment = projects.filter((p) => p.status === 'desenvolvimento').length;
  const inProduction = projects.filter((p) => p.status === 'producao').length;
  const blockedOrAttention = projects.filter((p) => p.health === 'atencao' || p.health === 'bloqueado').length;

  // Primary project in focus (default to first active project)
  const focusProject = projects.find((p) => p.id === 'advodesk') || projects[0] || null;

  const getProjectIcon = (name: string, type: string) => {
    if (name.includes('AdvoDesk') || name.includes('Emprovium')) {
      return (
        <span className="font-extrabold text-base font-heading text-white">
          {name.charAt(0)}
        </span>
      );
    }
    if (type.includes('Institucional') || name.includes('Civil')) {
      return <Globe className="w-5 h-5 text-emerald-400" />;
    }
    if (name.includes('Advogado')) {
      return <Shield className="w-5 h-5 text-amber-400" />;
    }
    return <Cog className="w-5 h-5 text-blue-400" />;
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'saudavel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 font-heading">
            <CheckCircle2 className="w-3 h-3" />
            SAUDÁVEL
          </span>
        );
      case 'atencao':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60 font-heading">
            <AlertTriangle className="w-3 h-3" />
            ATENÇÃO
          </span>
        );
      case 'bloqueado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/70 text-red-400 border border-red-800/70 font-heading">
            <Lock className="w-3 h-3" />
            BLOQUEADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 font-heading">
            NÃO AVALIADO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string, phase: string) => {
    switch (status) {
      case 'producao':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/40 text-emerald-300 border border-emerald-700/40">
            PRODUÇÃO
          </span>
        );
      case 'desenvolvimento':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/50 text-blue-300 border border-blue-800/50">
            {phase ? phase.toUpperCase() : 'DESENVOLVIMENTO'}
          </span>
        );
      case 'planejamento':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800/80 text-zinc-300 border border-zinc-700">
            PLANEJAMENTO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
          COMMAND
          <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
        </h1>
        <p className="text-xs text-[#808088] mt-1 font-mono-code">
          Central de comando dos seus projetos
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Projetos Ativos */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-[#383842] transition-colors">
          <div className="w-11 h-11 rounded-lg bg-[#141418] border border-[#2E2E38] flex items-center justify-center text-[#E84A32]">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Projetos Ativos
            </p>
            <p className="text-2xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {totalActive}
            </p>
          </div>
        </div>

        {/* Em Desenvolvimento */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-[#383842] transition-colors">
          <div className="w-11 h-11 rounded-lg bg-[#141418] border border-[#2E2E38] flex items-center justify-center text-[#E84A32]">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Em Desenvolvimento
            </p>
            <p className="text-2xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {inDevelopment}
            </p>
          </div>
        </div>

        {/* Em Produção */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-[#383842] transition-colors">
          <div className="w-11 h-11 rounded-lg bg-[#141418] border border-[#2E2E38] flex items-center justify-center text-[#E84A32]">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Em Produção
            </p>
            <p className="text-2xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {inProduction}
            </p>
          </div>
        </div>

        {/* Bloqueados / Atenção */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:border-[#383842] transition-colors">
          <div className="w-11 h-11 rounded-lg bg-[#141418] border border-[#2E2E38] flex items-center justify-center text-[#E84A32]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Bloqueados
            </p>
            <p className="text-2xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {blockedOrAttention}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Cockpit + Right Activity / Target Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: CONTINUE MISSÃO + VISÃO GERAL */}
        <div className="lg:col-span-8 space-y-6">
          {/* CONTINUE MISSÃO Hero Cockpit Card */}
          {focusProject && (
            <div className="bg-[#0D0807] border border-[#E84A32]/40 rounded-xl p-6 relative overflow-hidden shadow-[0_0_35px_-10px_rgba(232,74,50,0.2)] hud-card-corners">
              {/* Corner Tag */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E84A32] animate-ping" />
                <span className="text-[11px] font-bold font-heading text-[#E84A32] tracking-[0.2em] uppercase">
                  CONTINUE MISSÃO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Orbital Emblem */}
                <div className="md:col-span-4 flex items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* SVG Radar HUD Ring */}
                    <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#E84A32"
                        strokeWidth="1.5"
                        strokeDasharray="8 6"
                        fill="none"
                        opacity="0.6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#7D1A12"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>

                    {/* Central Icon Emblem */}
                    <div className="absolute inset-4 rounded-full bg-radial from-[#380603] to-[#0D0807] border border-[#E84A32] flex items-center justify-center shadow-[0_0_20px_rgba(232,74,50,0.4)]">
                      <span className="text-3xl font-extrabold font-heading text-white tracking-tighter">
                        {focusProject.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info and Progress */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold font-heading text-[#F2F2F3]">
                        {focusProject.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#A0A0A7]">FASE:</span>
                        <span className="text-xs font-semibold text-[#D8D8DC]">
                          {focusProject.phase}
                        </span>
                        {getHealthBadge(focusProject.health)}
                      </div>
                    </div>

                    {/* Progress Segment */}
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                        Progresso da Missão
                      </p>
                      <p className="text-2xl font-black font-heading text-[#F2F2F3]">
                        {focusProject.progress}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar with Mars Red */}
                  <div className="w-full bg-[#1A1A22] h-2 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#9E2214] via-[#E84A32] to-[#FF7A59] rounded-full transition-all duration-500 shadow-[0_0_10px_#E84A32]"
                      style={{ width: `${focusProject.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#66666D] font-mono-code">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>

                  {/* Next Action Box */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-[#E84A32] tracking-wider uppercase font-heading">
                      PRÓXIMA AÇÃO
                    </p>
                    <p className="text-xs text-[#F2F2F3] font-medium mt-0.5 line-clamp-2">
                      {getProjectNextMissionTitle(focusProject)}
                    </p>
                  </div>

                  {/* Continue Action Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onOpenProject(focusProject.id)}
                      className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.4)] transition-all font-heading"
                    >
                      <Target className="w-4 h-4" />
                      <span>Continuar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If no projects exist */}
          {projects.length === 0 && (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-12 text-center space-y-4 hud-card-corners">
              <div className="w-16 h-16 rounded-xl bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32] mx-auto shadow-[0_0_25px_rgba(232,74,50,0.2)]">
                <FolderKanban className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                  Nenhum projeto cadastrado
                </h3>
                <p className="text-xs text-[#808088] leading-relaxed">
                  Inicie a operação criando o primeiro projeto na central de comando marciana.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('projetos')}
                className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase inline-flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all font-heading"
              >
                <Target className="w-4 h-4" />
                <span>CRIAR PRIMEIRO PROJETO</span>
              </button>
            </div>
          )}

          {/* VISÃO GERAL DOS PROJETOS */}
          {projects.length > 0 && (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                  VISÃO GERAL DOS PROJETOS
                </h3>
                <button
                  onClick={() => onNavigateTab('projetos')}
                  className="text-xs text-[#E84A32] hover:text-[#FF6B4A] font-medium flex items-center gap-1 group"
                >
                  <span>Ver todos os projetos</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Horizontal Project Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {projects.map((proj) => {
                  const isCurrent = focusProject && proj.id === focusProject.id;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => onOpenProject(proj.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#120908] border-[#E84A32]/50 shadow-[0_0_15px_-3px_rgba(232,74,50,0.2)]'
                          : 'bg-[#0E0E12] border-[#1F1F24] hover:border-[#33333C]'
                      }`}
                    >
                      <div>
                        {/* Icon & Name */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-md bg-[#181820] border border-[#2C2C35] flex items-center justify-center shrink-0">
                            {getProjectIcon(proj.name, proj.type)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#F2F2F3] truncate">
                              {proj.name}
                            </p>
                          </div>
                        </div>

                        {/* Status / Phase Pill */}
                        <div className="mb-3 space-y-1">
                          {getStatusBadge(proj.status, proj.phase)}
                          {proj.health === 'atencao' && (
                            <div className="mt-1">{getHealthBadge(proj.health)}</div>
                          )}
                          {proj.health === 'saudavel' && proj.status === 'producao' && (
                            <div className="mt-1">{getHealthBadge(proj.health)}</div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar & Footer */}
                      <div className="space-y-1.5 pt-2 border-t border-[#1C1C22]">
                        <div className="flex items-center justify-between text-[10px] text-[#A0A0A7] font-heading">
                          <span>PROGRESSO</span>
                          <span className="font-bold text-[#F2F2F3]">{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E84A32] rounded-full"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-[#66666D] pt-0.5">
                          <span className="truncate">Atualizado</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" /> 1
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: ATIVIDADE RECENTE + FOCO ATUAL */}
        <div className="lg:col-span-4 space-y-6">
          {/* ATIVIDADE RECENTE Box */}
          <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              ATIVIDADE RECENTE
            </h3>

            <div className="space-y-3 pt-1">
              {history.length === 0 ? (
                <p className="text-xs text-[#66666D] py-4 text-center">Nenhuma atividade recente.</p>
              ) : (
                history.slice(0, 4).map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-2.5 text-xs">
                    {/* Category dot/icon */}
                    <div className="w-2 h-2 rounded-full bg-[#E84A32] mt-1.5 shrink-0 shadow-[0_0_6px_#E84A32]" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-[#F2F2F3] leading-tight truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#808088] truncate mt-0.5">
                        {item.projectName || 'Codex'}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#66666D] font-mono-code shrink-0">
                      {item.timestamp ? item.timestamp.split(' ')[1] || 'Recente' : 'Recente'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={() => onNavigateTab('historico')}
                className="w-full pt-3 mt-2 border-t border-[#1C1C22] text-center text-xs text-[#A0A0A7] hover:text-[#E84A32] flex items-center justify-center gap-1 font-medium transition-colors"
              >
                <span>Ver todas atividades</span>
                <span>&gt;&gt;</span>
              </button>
            )}
          </div>

          {/* FOCO ATUAL Box */}
          {focusProject && (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3 relative overflow-hidden hud-card-corners">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" />
                  FOCO ATUAL
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#E84A32] animate-ping" />
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                  PRÓXIMA MISSÃO
                </p>
                <p className="text-xs font-bold text-[#F2F2F3] leading-snug">
                  {getProjectNextMissionTitle(focusProject)}
                </p>
                <p className="text-[11px] text-[#A0A0A7]">
                  {focusProject.name} • {focusProject.phase}
                </p>

                {focusProject.nextTaskWhyImportant && (
                  <div className="pt-2 border-t border-[#1F1F24] mt-2">
                    <p className="text-[10px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                      POR QUE É IMPORTANTE
                    </p>
                    <p className="text-[11px] text-[#A0A0A7] mt-0.5 leading-relaxed">
                      {focusProject.nextTaskWhyImportant}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenProject(focusProject.id)}
                className="w-full pt-3 mt-2 border-t border-[#1C1C22] text-center text-xs text-[#E84A32] hover:underline font-medium flex items-center justify-center gap-1"
              >
                <span>Ver detalhes da missão</span>
                <span>&gt;^</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
