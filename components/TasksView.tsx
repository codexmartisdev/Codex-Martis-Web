'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskType, TaskPriority, TaskStatus } from '@/lib/types';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Bug,
  Shield,
  TrendingUp,
  PlusCircle,
  Network,
  FileText,
  Lightbulb,
  HelpCircle,
  Target,
  Trash2,
  Edit2,
} from 'lucide-react';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
  onOpenProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenNewTaskModal,
  onOpenProject,
  onNavigateTab,
}) => {
  const {
    tasks,
    projects,
    updateTask,
    deleteTask,
    setTaskAsNextMission,
    startSession,
  } = useStore();

  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metrics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pendente').length;
  const inProgressCount = tasks.filter((t) => t.status === 'Em andamento').length;
  const completedCount = tasks.filter((t) => t.status === 'Concluída').length;
  const blockedCount = tasks.filter((t) => t.priority === 'Crítica' && t.status !== 'Concluída').length;

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Bug':
        return <Bug className="w-3.5 h-3.5 text-red-400" />;
      case 'Auditoria':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'Melhoria':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case 'Feature':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Infraestrutura':
        return <Network className="w-3.5 h-3.5 text-blue-400" />;
      case 'Documentação':
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Ideia':
        return <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Crítica':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-heading bg-red-950/60 text-red-400 border border-red-800/80">
            CRÍTICA
          </span>
        );
      case 'Alta':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-heading bg-rose-950/50 text-[#FF5A43] border border-[#E84A32]/60">
            ALTA
          </span>
        );
      case 'Média':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-heading bg-amber-950/40 text-amber-300 border border-amber-800/60">
            MÉDIA
          </span>
        );
      case 'Baixa':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-heading bg-blue-950/40 text-blue-300 border border-blue-800/60">
            BAIXA
          </span>
        );
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Em andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-heading bg-amber-950/40 text-amber-400 border border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            EM ANDAMENTO
          </span>
        );
      case 'Pendente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-heading bg-zinc-900 text-zinc-400 border border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            PENDENTE
          </span>
        );
      case 'Concluída':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-heading bg-emerald-950/50 text-emerald-400 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            CONCLUÍDA
          </span>
        );
      case 'Executada não validada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-heading bg-purple-950/40 text-purple-300 border border-purple-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            NÃO VALIDADA
          </span>
        );
      case 'Cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-heading bg-zinc-900 text-zinc-500 border border-zinc-800">
            CANCELADA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
            TAREFAS
            <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
          </h1>
          <p className="text-xs text-[#808088] mt-1 font-mono-code">
            Gerencie todas as tarefas dos seus projetos
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNewTaskModal}
            className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>NOVA TAREFA</span>
          </button>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* TOTAL */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
              TOTAL
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {totalCount}
            </p>
            <p className="text-[9px] text-[#66666D]">tarefas</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-[#E84A32]">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        {/* PENDENTES */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
              PENDENTES
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {pendingCount}
            </p>
            <p className="text-[9px] text-[#66666D]">tarefas</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-zinc-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* EM ANDAMENTO */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
              EM ANDAMENTO
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {inProgressCount}
            </p>
            <p className="text-[9px] text-[#66666D]">tarefas</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-amber-400">
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>

        {/* CONCLUÍDAS */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
              CONCLUÍDAS
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {completedCount}
            </p>
            <p className="text-[9px] text-[#66666D]">tarefas</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* BLOQUEADAS */}
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-3.5 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
              BLOQUEADAS
            </p>
            <p className="text-xl font-black font-heading text-[#F2F2F3] mt-0.5">
              {blockedCount}
            </p>
            <p className="text-[9px] text-[#66666D]">tarefa</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter bar with dropdowns & search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 rounded-xl bg-[#0C0C0E] border border-[#232328]">
        {/* Project Select */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODOS OS PROJETOS</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Type Select */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODOS OS TIPOS</option>
          <option value="Bug">Bug</option>
          <option value="Auditoria">Auditoria</option>
          <option value="Melhoria">Melhoria</option>
          <option value="Feature">Feature</option>
          <option value="Infraestrutura">Infraestrutura</option>
          <option value="Teste">Teste</option>
          <option value="Documentação">Documentação</option>
        </select>

        {/* Priority Select */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODAS PRIORIDADES</option>
          <option value="Crítica">Crítica</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>

        {/* Status Select */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODOS STATUS</option>
          <option value="Pendente">Pendente</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluída">Concluída</option>
          <option value="Executada não validada">Não validada</option>
        </select>

        {/* Text Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#66666D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full bg-[#070709] border border-[#232328] focus:border-[#E84A32] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F2F2F3] placeholder-[#4E4E56] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Tasks Table */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E1E24] bg-[#09090C] text-[#808088] text-[10px] font-heading uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">+ TAREFA</th>
                <th className="py-3 px-4 font-bold">PROJETO</th>
                <th className="py-3 px-4 font-bold">TIPO</th>
                <th className="py-3 px-4 font-bold">PRIORIDADE</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">ATRIBUÍDO</th>
                <th className="py-3 px-4 font-bold">ATUALIZADO</th>
                <th className="py-3 px-4 font-bold text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181820]">
              {filteredTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isMenuOpen = activeMenuTaskId === task.id;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-[#101015] transition-colors group"
                  >
                    {/* Tarefa column with dot */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            task.priority === 'Crítica'
                              ? 'bg-[#E84A32] shadow-[0_0_8px_#E84A32]'
                              : task.status === 'Em andamento'
                              ? 'bg-amber-400'
                              : 'bg-zinc-600'
                          }`}
                        />
                        <div>
                          <p className="font-bold text-[#F2F2F3] text-xs leading-snug">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-[#808088] line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Projeto */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div
                        onClick={() => onOpenProject(task.projectId)}
                        className="cursor-pointer group-hover:text-[#E84A32] transition-colors"
                      >
                        <p className="font-bold text-[#D8D8DC] text-xs flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#E84A32]" />
                          {task.projectName}
                        </p>
                        <p className="text-[10px] text-[#66666D]">{project?.phase || 'Solo'}</p>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#C5C5CB]">
                        {getTypeIcon(task.type)}
                        <span>{task.type}</span>
                      </div>
                    </td>

                    {/* Prioridade */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(task.priority)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>

                    {/* Atribuído */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1F1412] border border-[#E84A32]/40 text-[#E84A32] text-[10px] font-bold flex items-center justify-center font-heading">
                          {task.assignedTo.charAt(0)}
                        </span>
                        <span className="text-xs text-[#D8D8DC]">{task.assignedTo}</span>
                      </div>
                    </td>

                    {/* Atualizado */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono-code text-[10px] text-[#808088]">
                      {task.updatedAt.slice(0, 10)}
                    </td>

                    {/* Ações dropdown */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            startSession(task.projectId, task.id, task.title);
                            onNavigateTab('sessoes');
                          }}
                          className="p-1 rounded text-[#A0A0A7] hover:text-[#E84A32] hover:bg-[#181820]"
                          title="Iniciar sessão com esta tarefa"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setActiveMenuTaskId(isMenuOpen ? null : task.id)
                          }
                          className="p-1 rounded text-[#66666D] hover:text-[#F2F2F3] hover:bg-[#181820]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {isMenuOpen && (
                        <div className="absolute right-4 mt-1 w-48 rounded-lg bg-[#0F0F14] border border-[#282830] shadow-2xl p-1.5 z-50 text-left animate-in fade-in">
                          <button
                            onClick={() => {
                              setTaskAsNextMission(task.projectId, task.id);
                              setActiveMenuTaskId(null);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-[#D8D8DC] hover:bg-[#1C1C24] hover:text-[#E84A32] rounded flex items-center gap-2 font-medium"
                          >
                            <Target className="w-3.5 h-3.5 text-[#E84A32]" />
                            Definir como missão
                          </button>

                          <button
                            onClick={() => {
                              updateTask(task.id, {
                                status: task.status === 'Concluída' ? 'Pendente' : 'Concluída',
                              });
                              setActiveMenuTaskId(null);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-[#D8D8DC] hover:bg-[#1C1C24] rounded flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {task.status === 'Concluída' ? 'Reabrir tarefa' : 'Marcar concluída'}
                          </button>

                          <div className="border-t border-[#1C1C24] my-1" />

                          <button
                            onClick={() => {
                              deleteTask(task.id);
                              setActiveMenuTaskId(null);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/30 rounded flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir tarefa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
