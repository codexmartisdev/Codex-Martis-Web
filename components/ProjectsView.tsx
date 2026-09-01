'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Project } from '@/lib/types';
import {
  FolderKanban,
  Code2,
  Rocket,
  Calendar,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Target,
  Globe,
  Shield,
  Cog,
  LayoutGrid,
  List,
  Layers,
  ArrowUpDown,
  Flame,
  CheckSquare,
} from 'lucide-react';

interface ProjectsViewProps {
  onOpenProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenImportProjectModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenProject,
  onOpenNewProjectModal,
  onOpenImportProjectModal,
  onNavigateTab,
}) => {
  const { projects, tasks, environments, history, getProjectNextMissionTitle } = useStore();
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'progress'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inspectedProjectId, setInspectedProjectId] = useState<string>('');

  // Selected project or first available
  const activeInspectedId = inspectedProjectId || (projects[0] ? projects[0].id : '');

  // Filtered list
  const filteredProjects = projects
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterCategory === 'todos') return true;
      if (filterCategory === 'desenvolvimento') return p.status === 'desenvolvimento';
      if (filterCategory === 'producao') return p.status === 'producao';
      if (filterCategory === 'planejamento') return p.status === 'planejamento';
      if (filterCategory === 'teste') return p.status === 'teste';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const inspectedProject =
    projects.find((p) => p.id === activeInspectedId) || projects[0] || null;

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
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/50 text-emerald-300 border border-emerald-700/40">
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
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
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

  // Metrics
  const totalProjects = projects.length;
  const inDevCount = projects.filter((p) => p.status === 'desenvolvimento').length;
  const inProdCount = projects.filter((p) => p.status === 'producao').length;
  const inPlanCount = projects.filter((p) => p.status === 'planejamento').length;
  const attentionCount = projects.filter((p) => p.health === 'atencao' || p.health === 'bloqueado').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Novo Projeto Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
            PROJETOS
            <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
          </h1>
          <p className="text-xs text-[#808088] mt-1 font-mono-code">
            Visão e gestão central dos sistemas em andamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Novo projeto</span>
          </button>

          <button
            onClick={onOpenImportProjectModal}
            className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] hover:border-[#E84A32]/60 text-[#F2F2F3] font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition-all font-heading"
          >
            <Code2 className="w-4 h-4 text-[#E84A32]" />
            <span>Importar Projeto JSON</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total de Projetos */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Total de Projetos
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3]">{totalProjects}</p>
            <p className="text-[9px] text-[#66666D]">100% do portfólio</p>
          </div>
        </div>

        {/* Em Desenvolvimento */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Em Desenvolvimento
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3]">{inDevCount}</p>
            <p className="text-[9px] text-[#66666D]">
              {Math.round((inDevCount / (totalProjects || 1)) * 100)}% do portfólio
            </p>
          </div>
        </div>

        {/* Em Produção */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Em Produção
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3]">{inProdCount}</p>
            <p className="text-[9px] text-[#66666D]">
              {Math.round((inProdCount / (totalProjects || 1)) * 100)}% do portfólio
            </p>
          </div>
        </div>

        {/* Em Planejamento */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Em Planejamento
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3]">{inPlanCount}</p>
            <p className="text-[9px] text-[#66666D]">
              {Math.round((inPlanCount / (totalProjects || 1)) * 100)}% do portfólio
            </p>
          </div>
        </div>

        {/* Atenção / Bloqueados */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#808088] tracking-wider uppercase font-heading">
              Atenção / Bloqueados
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3]">{attentionCount}</p>
            <p className="text-[9px] text-[#66666D]">
              {Math.round((attentionCount / (totalProjects || 1)) * 100)}% do portfólio
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-[#1C1C22]">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'desenvolvimento', label: 'Desenvolvimento' },
            { id: 'teste', label: 'Teste' },
            { id: 'producao', label: 'Produção' },
            { id: 'planejamento', label: 'Planejamento' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded text-xs font-semibold font-heading transition-all ${
                filterCategory === cat.id
                  ? 'bg-[#E84A32] text-white shadow-[0_0_12px_rgba(232,74,50,0.4)]'
                  : 'bg-[#0E0E12] text-[#A0A0A7] hover:text-[#F2F2F3] border border-[#232328]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Sort & View Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#A0A0A7]">
            <span className="text-[11px] font-heading">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0E0E12] border border-[#232328] rounded px-2.5 py-1 text-xs text-[#F2F2F3] focus:outline-none focus:border-[#E84A32]"
            >
              <option value="updated">Atualização</option>
              <option value="name">Nome (A-Z)</option>
              <option value="progress">Progresso</option>
            </select>
          </div>

          <div className="flex items-center bg-[#0E0E12] border border-[#232328] rounded p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-[#1C1C22] text-[#E84A32]' : 'text-[#66666D] hover:text-[#A0A0A7]'
              }`}
              title="Grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-[#1C1C22] text-[#E84A32]' : 'text-[#66666D] hover:text-[#A0A0A7]'
              }`}
              title="Lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects List + Right Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Project Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const projEnvs = environments.filter((e) => e.projectId === proj.id);
              const isSelected = inspectedProjectId === proj.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => setInspectedProjectId(proj.id)}
                  className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#120807] border-[#E84A32] shadow-[0_0_25px_-5px_rgba(232,74,50,0.25)] hud-card-corners'
                      : 'bg-[#0C0C0E] border-[#232328] hover:border-[#383844]'
                  }`}
                >
                  <div>
                    {/* Header: Icon + Name + Progress */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#181820] border border-[#2C2C35] flex items-center justify-center shrink-0">
                          {getProjectIcon(proj.name, proj.type)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold font-heading text-[#F2F2F3]">
                            {proj.name}
                          </h3>
                          <p className="text-[11px] text-[#808088]">
                            {proj.type} {proj.phase ? `• ${proj.phase}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                          PROGRESSO
                        </p>
                        <p className="text-lg font-black font-heading text-[#F2F2F3]">
                          {proj.progress}%
                        </p>
                      </div>
                    </div>

                    {/* Status & Health Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(proj.status, proj.phase)}
                      {getHealthBadge(proj.health)}
                    </div>

                    {/* Progress Segment Bar */}
                    <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-[#9E2214] to-[#E84A32] rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>

                    {/* Objective / Next Action */}
                    <div className="space-y-1 mb-4">
                      <p className="text-[10px] font-bold text-[#E84A32] uppercase tracking-wider font-heading">
                        {getProjectNextMissionTitle(proj) ? 'PRÓXIMA MISSÃO' : 'OBJETIVO ATUAL'}
                      </p>
                      <p className="text-xs text-[#D8D8DC] line-clamp-2 leading-relaxed">
                        {getProjectNextMissionTitle(proj) || proj.objective}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta & Open Button */}
                  <div className="pt-3 border-t border-[#1C1C22] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[10px] text-[#66666D]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atualizado
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        {projTasks.length} tarefas
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {projEnvs.length} ambientes
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(proj.id);
                      }}
                      className="px-3 py-1.5 rounded bg-[#181820] hover:bg-[#E84A32] text-[#D8D8DC] hover:text-white font-semibold text-[11px] tracking-wide transition-colors font-heading shrink-0"
                    >
                      Abrir projeto
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-12 text-center space-y-4 hud-card-corners">
              <p className="text-sm font-semibold text-[#808088]">Nenhum projeto encontrado.</p>
              <button
                onClick={onOpenNewProjectModal}
                className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading uppercase tracking-wider"
              >
                + Criar Projeto
              </button>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Project Inspector Summary */}
        <div className="lg:col-span-4 space-y-6">
          {inspectedProject ? (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-5 sticky top-20 hud-card-corners">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C22]">
                <span className="text-[11px] font-bold font-heading text-[#E84A32] uppercase tracking-wider">
                  RESUMO DO PROJETO
                </span>
                <Target className="w-4 h-4 text-[#E84A32]" />
              </div>

              {/* Project Title and Icon */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1A0A08] border border-[#E84A32]/60 flex items-center justify-center text-white text-xl font-bold font-heading shadow-[0_0_15px_rgba(232,74,50,0.3)]">
                  {inspectedProject.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-[#F2F2F3]">
                    {inspectedProject.name}
                  </h2>
                  <p className="text-xs text-[#808088]">
                    {inspectedProject.type} • {inspectedProject.phase}
                  </p>
                </div>
              </div>

              {/* Current Objective */}
              <div>
                <p className="text-[10px] font-semibold text-[#808088] uppercase tracking-wider font-heading mb-1">
                  OBJETIVO ATUAL
                </p>
                <p className="text-xs text-[#D8D8DC] leading-relaxed bg-[#101014] p-3 rounded-lg border border-[#1C1C22]">
                  {inspectedProject.objective}
                </p>
              </div>

              {/* Próxima Missão */}
              <div>
                <p className="text-[10px] font-bold text-[#E84A32] uppercase tracking-wider font-heading mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E84A32] animate-ping" />
                  PRÓXIMA MISSÃO
                </p>
                <p className="text-xs font-semibold text-[#E84A32] leading-snug">
                  {getProjectNextMissionTitle(inspectedProject)}
                </p>
              </div>

              {/* Connected Environments */}
              <div>
                <p className="text-[10px] font-semibold text-[#808088] uppercase tracking-wider font-heading mb-2">
                  AMBIENTES CONECTADOS
                </p>
                <div className="space-y-1.5">
                  {environments
                    .filter((e) => e.projectId === inspectedProject.id)
                    .map((env) => (
                      <div
                        key={env.id}
                        className="flex items-center justify-between p-2 rounded bg-[#101014] border border-[#1C1C22] text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A22] text-[#A0A0A7] font-mono-code font-bold">
                            {env.badgeCode || env.category}
                          </span>
                          <span className="text-[#D8D8DC] truncate font-medium">{env.name}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                          Configurado
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Big CTA */}
              <button
                onClick={() => onOpenProject(inspectedProject.id)}
                className="w-full py-3 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.4)] transition-all font-heading"
              >
                <Target className="w-4 h-4" />
                <span>Ver Command Center</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 text-center text-xs text-[#808088]">
              Selecione um projeto para ver o resumo.
            </div>
          )}

          {/* Atividades Recentes Box */}
          <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider">
              ATIVIDADES RECENTES
            </h3>
            <div className="space-y-2.5">
              {history.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E84A32] mt-1.5 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-[#F2F2F3] truncate">{h.title}</p>
                    <p className="text-[11px] text-[#808088] truncate">{h.projectName}</p>
                  </div>
                  <span className="text-[10px] text-[#66666D] font-mono-code shrink-0">
                    {h.timestamp.split(' ')[1] || 'Hoje'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigateTab('historico')}
              className="w-full pt-2 border-t border-[#1C1C22] text-center text-xs text-[#A0A0A7] hover:text-[#E84A32] transition-colors"
            >
              Ver todas atividades &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
