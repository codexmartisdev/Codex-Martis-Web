'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Project, Task, Environment, Session } from '@/lib/types';
import {
  ArrowLeft,
  Target,
  PlayCircle,
  FileCode,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Download,
  Eye,
  Plus,
  Server,
  Clock,
  Code2,
  CheckSquare,
  Sparkles,
  Layers,
  ChevronRight,
  Send,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ProjectCommandCenterProps {
  projectId: string;
  onBack: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewTaskModalForProject: (projectId: string) => void;
  onOpenNewEnvModalForProject: (projectId: string) => void;
}

export const ProjectCommandCenter: React.FC<ProjectCommandCenterProps> = ({
  projectId,
  onBack,
  onNavigateTab,
  onOpenNewTaskModalForProject,
  onOpenNewEnvModalForProject,
}) => {
  const {
    projects,
    tasks,
    sessions,
    environments,
    startSession,
    setTaskAsNextMission,
    updateProject,
    updateTask,
    getProjectPrompt,
    importProjectUpdateJson,
    applyParsedUpdate,
    getProjectNextMissionTitle,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'tarefas' | 'sessoes' | 'ambientes' | 'prompt' | 'importar'>('geral');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonValidationResult, setJsonValidationResult] = useState<any>(null);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);

  const project = projects.find((p) => p.id === projectId) || projects[0];

  if (!project) {
    return (
      <div className="p-8 text-center text-xs text-[#808088]">
        Projeto não encontrado.{' '}
        <button onClick={onBack} className="text-[#E84A32] underline">
          Voltar
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectSessions = sessions.filter((s) => s.projectId === project.id);
  const projectEnvironments = environments.filter((e) => e.projectId === project.id);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  const handleDownloadPrompt = (includeContext: boolean) => {
    const text = getProjectPrompt(project.id, includeContext);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codex-prompt-${project.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidateJson = () => {
    if (!jsonInput.trim()) {
      setJsonValidationResult({ success: false, error: 'Por favor, cole um JSON gerado pela IA.' });
      return;
    }
    const result = importProjectUpdateJson(project.id, jsonInput);
    setJsonValidationResult(result);
  };

  const handleApplyJsonUpdate = () => {
    if (jsonValidationResult?.diff) {
      applyParsedUpdate(project.id, jsonValidationResult.diff);
      alert('Atualização aplicada com sucesso! O estado do projeto, tarefas e histórico foram sincronizados.');
      setJsonInput('');
      setJsonValidationResult(null);
      setActiveSubTab('geral');
    }
  };

  const loadSampleJson = () => {
    const sample = `{
  "schema_version": "1.0",
  "project_id": "${project.id}",
  "health": "saudavel",
  "progress": ${Math.min(100, project.progress + 15)},
  "status_summary": "Persistência do Firestore validada com sucesso e corrigida para múltiplos registros.",
  "next_mission": {
    "title": "Remover dados fictícios do fluxo de documentos",
    "why_important": "Eliminar resquícios de mocks após testes de homologação.",
    "recommended_tool": "Google AI Studio"
  },
  "completed_task_titles": [
    "${project.nextTaskTitle}"
  ],
  "new_tasks": [
    {
      "title": "Implementar índices compostos no Firestore",
      "description": "Criar regras de indexação para ordenação de petições por data.",
      "type": "Infraestrutura",
      "priority": "Alta"
    }
  ],
  "resolved_issues": [
    "Corrigido salvamento assíncrono que perdia o ID do processo"
  ],
  "commit": {
    "hash": "f44b890",
    "message": "fix(firestore): ensure atomic process creation and document sync"
  },
  "deploy": {
    "performed": true,
    "environment": "Produção",
    "target": "Vercel"
  },
  "decisions": [
    "Adotado schema otimizado para evitar leituras desnecessárias de subcoleções"
  ],
  "state_photograph": {
    "working": ["Autenticação", "Cadastro de processos real", "Navegação"],
    "partially_working": ["Fluxo de petições"],
    "not_working": [],
    "untested": ["Exportação PDF"]
  }
}`;
    setJsonInput(sample);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#A0A0A7] hover:text-[#E84A32] transition-colors font-heading group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>VOLTAR PARA PROJETOS</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              startSession(project.id, project.nextTaskId || undefined, project.nextTaskTitle);
              onNavigateTab('sessoes');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-1.5 shadow-[0_0_15px_rgba(232,74,50,0.4)] transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>INICIAR SESSÃO</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Cockpit Card */}
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl p-6 relative overflow-hidden hud-card-corners">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Project Title & Identifiers */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#180A08] border border-[#E84A32]/60 flex items-center justify-center text-2xl font-black font-heading text-white shadow-[0_0_20px_rgba(232,74,50,0.3)] shrink-0">
              {project.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black font-heading text-[#F2F2F3]">
                  {project.name}
                </h1>
                <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-[#181820] text-[#A0A0A7] border border-[#282830]">
                  ID: {project.identifier}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 uppercase font-heading">
                  {project.phase}
                </span>
              </div>
              <p className="text-xs text-[#A0A0A7] mt-1 max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>

          {/* Health & Progress Status Block */}
          <div className="flex flex-wrap items-center gap-6 self-start lg:self-auto bg-[#101014] p-3.5 rounded-lg border border-[#202026]">
            {/* Status */}
            <div>
              <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                Status
              </p>
              <p className="text-xs font-bold text-[#F2F2F3] uppercase font-heading mt-0.5">
                {project.status}
              </p>
            </div>

            {/* Health */}
            <div>
              <p className="text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading">
                Saúde
              </p>
              <div className="mt-0.5">
                {project.health === 'saudavel' && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saudável
                  </span>
                )}
                {project.health === 'atencao' && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-heading">
                    <AlertTriangle className="w-3.5 h-3.5" /> Atenção
                  </span>
                )}
                {project.health === 'bloqueado' && (
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1 font-heading">
                    <Lock className="w-3.5 h-3.5" /> Bloqueado
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="min-w-[120px]">
              <div className="flex items-center justify-between text-[9px] font-semibold text-[#808088] uppercase tracking-wider font-heading mb-1">
                <span>Progresso</span>
                <span className="text-xs text-[#F2F2F3] font-bold">{project.progress}%</span>
              </div>
              <div className="w-full bg-[#1C1C24] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9E2214] to-[#E84A32] rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#1C1C22]">
          {[
            { id: 'geral', label: 'Visão Geral & Missão', icon: Target },
            { id: 'tarefas', label: `Tarefas (${projectTasks.length})`, icon: CheckSquare },
            { id: 'sessoes', label: `Sessões (${projectSessions.length})`, icon: Clock },
            { id: 'ambientes', label: `Ambientes (${projectEnvironments.length})`, icon: Server },
            { id: 'prompt', label: 'Prompt de IA', icon: FileCode },
            { id: 'importar', label: 'Importar JSON', icon: UploadCloud },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-heading transition-all ${
                  isTabActive
                    ? 'bg-[#E84A32] text-white shadow-[0_0_15px_rgba(232,74,50,0.35)]'
                    : 'bg-[#101014] text-[#A0A0A7] hover:text-[#F2F2F3] hover:bg-[#18181F] border border-[#202026]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB TAB 1: VISÃO GERAL */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Objetivo Atual + Próxima Missão + Fotografia */}
          <div className="lg:col-span-7 space-y-6">
            {/* PRÓXIMA MISSÃO Main Highlight */}
            <div className="bg-[#120807] border border-[#E84A32]/70 rounded-xl p-5 relative overflow-hidden shadow-[0_0_30px_-5px_rgba(232,74,50,0.25)] hud-card-corners">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E84A32] animate-ping" />
                  PRÓXIMA MISSÃO PRINCIPAL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E84A32]/20 text-[#E84A32] font-semibold uppercase font-heading">
                  Prioridade {project.priority}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#F2F2F3] leading-snug">
                {getProjectNextMissionTitle(project)}
              </h2>

              {project.nextTaskWhyImportant && (
                <div className="mt-3 p-3 rounded-lg bg-[#180907] border border-[#E84A32]/30 text-xs text-[#D8D8DC]">
                  <p className="text-[10px] font-bold text-[#FF7A59] uppercase font-heading mb-1">
                    POR QUE É IMPORTANTE:
                  </p>
                  <p className="leading-relaxed">{project.nextTaskWhyImportant}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[#E84A32]/20">
                <div className="text-xs text-[#A0A0A7] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#E84A32]" />
                  <span>Ferramenta recomendada:</span>
                  <span className="font-semibold text-white">
                    {project.recommendedTool || 'Google Cloud Shell'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const missionTitle = getProjectNextMissionTitle(project);
                    startSession(project.id, project.nextTaskId || undefined, missionTitle);
                    onNavigateTab('sessoes');
                  }}
                  className="px-5 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(232,74,50,0.4)] transition-all font-heading"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>INICIAR SESSÃO</span>
                </button>
              </div>
            </div>

            {/* OBJETIVO ATUAL DA FASE */}
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E84A32]" />
                OBJETIVO DA FASE ATUAL ({project.phase})
              </h3>
              <p className="text-xs text-[#D8D8DC] leading-relaxed bg-[#101014] p-3.5 rounded-lg border border-[#1C1C22]">
                {project.objective}
              </p>
            </div>

            {/* FOTOGRAFIA DO ESTADO ATUAL */}
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                  FOTOGRAFIA DO ESTADO ATUAL
                </h3>
                <span className="text-[10px] text-[#808088] font-mono-code">Status real</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Funcionando */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-heading flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Funcionando ({project.statePhoto?.working?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.statePhoto?.working?.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px]"
                      >
                        {item}
                      </span>
                    )) || <span className="text-[#66666D]">Nenhum item listado.</span>}
                  </div>
                </div>

                {/* Parcialmente Funcionando */}
                <div className="pt-2 border-t border-[#18181D]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-heading flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Parcialmente funcionando ({project.statePhoto?.partiallyWorking?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.statePhoto?.partiallyWorking?.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px]"
                      >
                        {item}
                      </span>
                    )) || <span className="text-[#66666D]">Nenhum item.</span>}
                  </div>
                </div>

                {/* Não Funcionando / Bloqueado */}
                {project.statePhoto?.notWorking && project.statePhoto.notWorking.length > 0 && (
                  <div className="pt-2 border-t border-[#18181D]">
                    <span className="text-[10px] font-bold text-red-400 uppercase font-heading flex items-center gap-1.5 mb-1.5">
                      <Lock className="w-3.5 h-3.5" /> Não funcionando ({project.statePhoto.notWorking.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.statePhoto.notWorking.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-300 text-[11px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fora do Escopo na v1 */}
                {project.statePhoto?.outOfScope && project.statePhoto.outOfScope.length > 0 && (
                  <div className="pt-2 border-t border-[#18181D]">
                    <span className="text-[10px] font-bold text-[#808088] uppercase font-heading flex items-center gap-1.5 mb-1.5">
                      Fora do escopo na v1
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.statePhoto.outOfScope.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#181820] border border-[#26262E] text-[#A0A0A7] text-[11px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Quick Tasks + Ambientes + Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Open Tasks Card */}
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#E84A32]" />
                  TAREFAS ABERTAS ({projectTasks.filter((t) => t.status !== 'Concluída').length})
                </h3>
                <button
                  onClick={() => onOpenNewTaskModalForProject(project.id)}
                  className="text-[11px] text-[#E84A32] hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nova
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {projectTasks
                  .filter((t) => t.status !== 'Concluída' && t.status !== 'Cancelada')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-[#101014] border border-[#1C1C22] hover:border-[#2C2C36] transition-all text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#F2F2F3] truncate">{task.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#A0A0A7] font-mono-code shrink-0">
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#181820]">
                        <span className="text-[10px] text-[#808088]">{task.type}</span>
                        {task.isNextMission ? (
                          <span className="text-[10px] font-bold text-[#E84A32] flex items-center gap-1 font-heading">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E84A32]" /> Próxima Missão
                          </span>
                        ) : (
                          <button
                            onClick={() => setTaskAsNextMission(project.id, task.id)}
                            className="text-[10px] text-[#A0A0A7] hover:text-[#E84A32] underline"
                          >
                            Definir como missão
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ambientes Conectados */}
            <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#E84A32]" />
                  AMBIENTES DO PROJETO
                </h3>
                <button
                  onClick={() => onOpenNewEnvModalForProject(project.id)}
                  className="text-[11px] text-[#E84A32] hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {projectEnvironments.map((env) => (
                  <div
                    key={env.id}
                    className="p-2.5 rounded-lg bg-[#101014] border border-[#1C1C22] flex items-center justify-between text-xs"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C1C24] text-[#D8D8DC] font-mono-code font-bold">
                          {env.badgeCode || env.category}
                        </span>
                        <span className="font-semibold text-[#F2F2F3] truncate">{env.name}</span>
                      </div>
                      <p className="text-[10px] text-[#66666D] truncate mt-0.5">
                        {env.url || env.identifier}
                      </p>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                      {env.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: TAREFAS DO PROJETO */}
      {activeSubTab === 'tarefas' && (
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              Tarefas Cadastradas em {project.name}
            </h2>
            <button
              onClick={() => onOpenNewTaskModalForProject(project.id)}
              className="px-3 py-1.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Tarefa
            </button>
          </div>

          <div className="space-y-2.5">
            {projectTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-lg bg-[#101014] border border-[#1C1C22] hover:border-[#2C2C35] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F2F2F3] text-sm">{t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#A0A0A7] font-mono-code">
                      {t.type}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#D8D8DC] font-mono-code font-bold">
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#808088] leading-relaxed">{t.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value as any })}
                    className="bg-[#0A0A0D] border border-[#282830] rounded px-2 py-1 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Executada não validada">Executada não validada</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>

                  {t.isNextMission ? (
                    <span className="px-2.5 py-1 rounded bg-[#E84A32]/20 text-[#E84A32] font-bold text-[10px] font-heading">
                      MISSÃO PRINCIPAL
                    </span>
                  ) : (
                    <button
                      onClick={() => setTaskAsNextMission(project.id, t.id)}
                      className="px-2.5 py-1 rounded bg-[#181820] hover:bg-[#E84A32] text-[#D8D8DC] hover:text-white font-medium text-[10px] font-heading transition-colors"
                    >
                      Definir como missão
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: SESSÕES DO PROJETO */}
      {activeSubTab === 'sessoes' && (
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              Histórico de Sessões Executadas ({projectSessions.length})
            </h2>
            <button
              onClick={() => {
                const missionTitle = getProjectNextMissionTitle(project);
                startSession(project.id, project.nextTaskId || undefined, missionTitle);
                onNavigateTab('sessoes');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Iniciar Nova Sessão
            </button>
          </div>

          <div className="space-y-3">
            {projectSessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-lg bg-[#101014] border border-[#1C1C22] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-heading text-[#E84A32]">
                      SESSÃO #{s.sessionNumber.toString().padStart(3, '0')}
                    </span>
                    <span className="text-[10px] text-[#808088] font-mono-code">
                      {s.startedAt.slice(0, 10)}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold font-heading">
                    {s.result || 'Concluída'}
                  </span>
                </div>

                <p className="font-medium text-[#F2F2F3]">{s.objective}</p>
                {s.workDone && <p className="text-[#808088]">{s.workDone}</p>}

                {s.commitHash && (
                  <div className="flex items-center gap-2 text-[10px] text-[#A0A0A7] pt-1">
                    <span className="font-mono-code bg-[#1A1A22] px-1.5 py-0.5 rounded text-[#C5C5CB]">
                      Commit: {s.commitHash}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: AMBIENTES */}
      {activeSubTab === 'ambientes' && (
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              Mapa Técnico de Ambientes e Serviços
            </h2>
            <button
              onClick={() => onOpenNewEnvModalForProject(project.id)}
              className="px-3 py-1.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Ambiente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectEnvironments.map((env) => (
              <div
                key={env.id}
                className="p-4 rounded-lg bg-[#101014] border border-[#1C1C22] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F2F2F3]">{env.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#A0A0A7] font-mono-code">
                      {env.category}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold">
                    {env.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#A0A0A7]">{env.service} • {env.account}</p>
                {env.url && (
                  <p className="text-[11px] text-[#E84A32] font-mono-code truncate">{env.url}</p>
                )}
                {env.observations && (
                  <p className="text-[10px] text-[#808088] pt-1 border-t border-[#181820]">
                    {env.observations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 5: PROMPT DE IA */}
      {activeSubTab === 'prompt' && (
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              PROMPT DE ATUALIZAÇÃO DO PROJETO (SCHEMA 1.0)
            </h2>
            <p className="text-xs text-[#808088] mt-1">
              Copie este prompt gerado com o contexto exato do projeto para colar no ChatGPT ou Google AI Studio após suas sessões de código.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopy(getProjectPrompt(project.id, false), 'prompt_base')}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] hover:text-white text-xs font-bold font-heading flex items-center gap-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[#E84A32]" />
              <span>COPIAR PROMPT BASE</span>
            </button>

            <button
              onClick={() => handleCopy(getProjectPrompt(project.id, true), 'prompt_context')}
              className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-2 shadow-[0_0_15px_rgba(232,74,50,0.4)] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>COPIAR PROMPT + CONTEXTO COMPLETO</span>
            </button>

            <button
              onClick={() => handleDownloadPrompt(true)}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] text-xs font-bold font-heading flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>BAIXAR .TXT</span>
            </button>
          </div>

          {copySuccess && (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
              ✓ Prompt copiado para a área de transferência com sucesso! Cole no ChatGPT ou Google AI Studio.
            </div>
          )}

          {/* Prompt Preview Code Box */}
          <div className="relative">
            <div className="flex items-center justify-between px-3.5 py-2 rounded-t-lg bg-[#141418] border border-[#232328] text-xs text-[#808088] font-mono-code">
              <span>Preview do Prompt + Contexto</span>
              <span>Schema v1.0</span>
            </div>
            <pre className="p-4 rounded-b-lg bg-[#08080A] border-x border-b border-[#232328] text-xs font-mono-code text-[#C5C5CB] overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {getProjectPrompt(project.id, true)}
            </pre>
          </div>
        </div>
      )}

      {/* SUB TAB 6: IMPORTAR ATUALIZAÇÃO JSON */}
      {activeSubTab === 'importar' && (
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#E84A32]" />
                IMPORTAR ATUALIZAÇÃO JSON
              </h2>
              <p className="text-xs text-[#808088] mt-1">
                Cole a resposta JSON gerada pela IA para sincronizar o estado real do projeto, tarefas concluídas e próxima missão.
              </p>
            </div>

            <button
              onClick={loadSampleJson}
              className="px-3 py-1.5 rounded bg-[#181820] hover:bg-[#20202A] text-amber-400 border border-amber-500/30 text-xs font-medium font-heading self-start sm:self-auto"
            >
              Carregar Exemplo de Teste
            </button>
          </div>

          <div className="space-y-3">
            <textarea
              rows={9}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Cole aqui o JSON gerado pelo ChatGPT ou Google AI Studio (schema_version: '1.0')..."
              className="w-full bg-[#070709] border border-[#232328] focus:border-[#E84A32] rounded-lg p-4 font-mono-code text-xs text-[#F2F2F3] placeholder-[#4E4E56] focus:outline-none transition-colors"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleValidateJson}
                className="px-5 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-2 shadow-[0_0_15px_rgba(232,74,50,0.3)] transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>VALIDAR JSON</span>
              </button>

              {jsonValidationResult && (
                <button
                  onClick={() => {
                    setJsonValidationResult(null);
                    setJsonInput('');
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] text-xs font-medium transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Validation Errors or Diff Preview */}
          {jsonValidationResult && !jsonValidationResult.success && (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs space-y-1">
              <p className="font-bold">Erro de validação:</p>
              <p>{jsonValidationResult.error}</p>
            </div>
          )}

          {jsonValidationResult?.success && jsonValidationResult.diff && (
            <div className="p-5 rounded-xl bg-[#0F0807] border border-[#E84A32]/60 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E84A32]/30">
                <span className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider">
                  PRÉ-VISUALIZAÇÃO DAS ALTERAÇÕES (PATCH DIFF)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono-code font-bold">
                  ✓ Schema 1.0 Válido
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Health Diff */}
                <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412]">
                  <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                    Saúde do Projeto
                  </p>
                  <p className="text-[#D8D8DC] mt-1">
                    <span className="text-[#808088]">{jsonValidationResult.diff.health.current}</span>
                    {' → '}
                    <span className="text-emerald-400 font-bold">
                      {jsonValidationResult.diff.health.new}
                    </span>
                  </p>
                </div>

                {/* Progress Diff */}
                <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412]">
                  <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                    Progresso
                  </p>
                  <p className="text-[#D8D8DC] mt-1">
                    <span className="text-[#808088]">{jsonValidationResult.diff.progress.current}%</span>
                    {' → '}
                    <span className="text-[#E84A32] font-bold">
                      {jsonValidationResult.diff.progress.new}%
                    </span>
                  </p>
                </div>

                {/* Nova Próxima Missão */}
                <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412] md:col-span-2">
                  <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                    Nova Próxima Missão
                  </p>
                  <p className="text-white font-bold mt-1">
                    {jsonValidationResult.diff.nextMission.new}
                  </p>
                </div>

                {/* Tarefas Concluídas */}
                {jsonValidationResult.diff.completedTasks.length > 0 && (
                  <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412] md:col-span-2">
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase font-heading">
                      Tarefas a Marcar como Concluídas ({jsonValidationResult.diff.completedTasks.length})
                    </p>
                    <ul className="list-disc list-inside text-[#D8D8DC] mt-1 space-y-0.5">
                      {jsonValidationResult.diff.completedTasks.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Novas Tarefas */}
                {jsonValidationResult.diff.newTasks.length > 0 && (
                  <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412] md:col-span-2">
                    <p className="text-[10px] font-semibold text-blue-400 uppercase font-heading">
                      Novas Tarefas Descobertas ({jsonValidationResult.diff.newTasks.length})
                    </p>
                    <ul className="list-disc list-inside text-[#D8D8DC] mt-1 space-y-0.5">
                      {jsonValidationResult.diff.newTasks.map((nt: any, i: number) => (
                        <li key={i}>
                          <span className="font-bold">{nt.title}</span> ({nt.type || 'Melhoria'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commit */}
                {jsonValidationResult.diff.commit && (
                  <div className="p-3 rounded bg-[#140C0B] border border-[#2C1412] md:col-span-2">
                    <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                      Commit Informado
                    </p>
                    <p className="text-[#D8D8DC] font-mono-code mt-1">
                      {jsonValidationResult.diff.commit.hash}: {jsonValidationResult.diff.commit.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E84A32]/30">
                <button
                  onClick={() => setJsonValidationResult(null)}
                  className="px-4 py-2 rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#A0A0A7] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyJsonUpdate}
                  className="px-6 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading uppercase shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all"
                >
                  Aplicar Atualização
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
