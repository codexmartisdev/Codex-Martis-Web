'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Project, Task, Environment, Session, ProjectUpdateDiff } from '@/lib/types';
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
  Check,
  HelpCircle,
  GitCommit,
  Globe,
  ShieldAlert,
  Terminal,
  Activity,
  ListTodo,
  FileText,
  XCircle,
} from 'lucide-react';
import { PromptViewerModal } from './PromptViewerModal';

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

  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'tarefas' | 'sessoes' | 'ambientes' | 'ia-update'>('geral');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonValidationResult, setJsonValidationResult] = useState<any>(null);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [showPromptInlinePreview, setShowPromptInlinePreview] = useState<boolean>(false);
  const [appliedSuccessNotice, setAppliedSuccessNotice] = useState<string | null>(null);

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
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleDownloadPrompt = (includeContext: boolean) => {
    const text = getProjectPrompt(project.id, includeContext);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codex-martis-project-update-schema-1.0.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidateJson = () => {
    if (!jsonInput.trim()) {
      setJsonValidationResult({ success: false, error: 'Por favor, cole um JSON gerado pela IA antes de validar.' });
      return;
    }
    const result = importProjectUpdateJson(project.id, jsonInput);
    setJsonValidationResult(result);
  };

  const handleApplyJsonUpdate = () => {
    if (jsonValidationResult?.diff) {
      applyParsedUpdate(project.id, jsonValidationResult.diff, jsonInput);
      setAppliedSuccessNotice('Atualização aplicada com sucesso! O estado do projeto, tarefas, fotografia e histórico foram sincronizados.');
      setJsonInput('');
      setJsonValidationResult(null);
      setTimeout(() => {
        setAppliedSuccessNotice(null);
        setActiveSubTab('geral');
      }, 3500);
    }
  };

  const loadSampleJson = () => {
    const nextMissionTask = projectTasks.find((t) => t.isNextMission) || projectTasks[0];
    const sample = `{
  "schema_version": "1.0",
  "project_id": "${project.id}",
  "project_name": "${project.name}",
  "timestamp": "${new Date().toISOString()}",
  "status_summary": "Persistência do Firestore validada com sucesso e corrigida para múltiplos registros. Auditoria técnica concluída.",
  "health": "saudavel",
  "progress": ${Math.min(100, (project.progress || 70) + 10)},
  "current_phase": "${project.phase || 'Beta Solo'}",
  "next_mission": {
    "title": "Remover resquícios de dados fictícios do fluxo de petições",
    "why_important": "Garantir integridade operacional estrita sem ruído de mock data.",
    "recommended_tool": "Google AI Studio"
  },
  "completed_tasks": [
    ${nextMissionTask ? `{\n      "task_id": "${nextMissionTask.id}",\n      "title": "${nextMissionTask.title}"\n    }` : `{\n      "title": "${getProjectNextMissionTitle(project)}"\n    }`}
  ],
  "updated_tasks": [],
  "new_tasks": [
    {
      "title": "Implementar índices compostos no Firestore",
      "description": "Criar regras de indexação para ordenação de petições por data e status.",
      "type": "Infraestrutura",
      "priority": "Alta",
      "status": "Pendente"
    }
  ],
  "issues": [
    {
      "title": "Monitorar latência de cold start nas Cloud Functions",
      "type": "Risco",
      "severity": "Média"
    }
  ],
  "decisions": [
    {
      "title": "Adotar queries atômicas para gravação de documentos",
      "reason": "Evitar inconsistência de estado no Firestore quando a rede oscilar",
      "impact": "Redução de 40% em potenciais falhas de concorrência"
    }
  ],
  "technical_changes": {
    "added_libraries": [],
    "modified_files": ["lib/firebase/db.ts", "firestore.rules"],
    "configuration_changes": ["firestore.rules atualizado com regras atômicas"]
  },
  "environments": [
    {
      "identifier": "${projectEnvironments[0]?.identifier || 'advodesk-prod'}",
      "status": "Ativo",
      "observations": "Validado em homologação sem erros de permissão."
    }
  ],
  "repository": {
    "commit_hash": "f44b890",
    "commit_message": "fix(firestore): ensure atomic process creation and document sync",
    "branch": "main"
  },
  "deployment": {
    "performed": true,
    "environment": "Produção",
    "platform": "Vercel",
    "url": "${projectEnvironments[0]?.url || 'https://advodesk.vercel.app'}",
    "observations": "Deploy realizado sem erros."
  },
  "known_state": {
    "working": ["Autenticação Google", "Cadastro de processos real", "Navegação por pastas"],
    "partially_working": ["Fluxo de petições"],
    "not_working": [],
    "not_tested": ["Exportação PDF"],
    "out_of_scope": ["Integração Google Drive (removido da v1)"]
  },
  "session_summary": {
    "duration_minutes": 45,
    "result": "Sucesso",
    "notes": "Sessão concluída com validação integral da persistência em banco."
  }
}`;
    setJsonInput(sample);
    setJsonValidationResult(null);
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
            onClick={() => setActiveSubTab('ia-update')}
            className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] hover:text-white text-xs font-bold font-heading flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E84A32]" />
            <span>ATUALIZAR VIA IA</span>
          </button>
          <button
            onClick={() => {
              const missionTitle = getProjectNextMissionTitle(project);
              startSession(project.id, project.nextTaskId || undefined, missionTitle);
              onNavigateTab('sessoes');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-1.5 shadow-[0_0_15px_rgba(232,74,50,0.4)] transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>INICIAR SESSÃO</span>
          </button>
        </div>
      </div>

      {/* Applied Success Notification Toast */}
      {appliedSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs font-medium flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{appliedSuccessNotice}</span>
          </div>
          <button
            onClick={() => setAppliedSuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold uppercase font-heading"
          >
            Dispensar
          </button>
        </div>
      )}

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
            { id: 'ia-update', label: 'Atualização por IA', icon: Sparkles, highlight: true },
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
                    : tab.highlight
                    ? 'bg-[#180A08] text-[#FF8570] hover:text-white hover:bg-[#25100D] border border-[#E84A32]/40'
                    : 'bg-[#101014] text-[#A0A0A7] hover:text-[#F2F2F3] hover:bg-[#18181F] border border-[#202026]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.highlight && !isTabActive ? 'text-[#E84A32]' : ''}`} />
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
                  Prioridade {project.priority || 'Alta'}
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
                    {project.recommendedTool || 'Google AI Studio'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('ia-update')}
                    className="px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#D8D8DC] text-xs font-heading font-bold flex items-center gap-1.5 transition-colors border border-[#282832]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E84A32]" />
                    <span>Prompt IA</span>
                  </button>
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
                <span className="text-[10px] text-[#808088] font-mono-code">Status operacional</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Funcionando */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-heading flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Funcionando ({project.statePhoto?.working?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.statePhoto?.working && project.statePhoto.working.length > 0 ? (
                      project.statePhoto.working.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px]"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#66666D]">Nenhum item listado.</span>
                    )}
                  </div>
                </div>

                {/* Parcialmente Funcionando */}
                <div className="pt-2 border-t border-[#18181D]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-heading flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Parcialmente funcionando ({project.statePhoto?.partiallyWorking?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.statePhoto?.partiallyWorking && project.statePhoto.partiallyWorking.length > 0 ? (
                      project.statePhoto.partiallyWorking.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px]"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#66666D]">Nenhum item.</span>
                    )}
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

                {/* Não Testado */}
                {project.statePhoto?.untested && project.statePhoto.untested.length > 0 && (
                  <div className="pt-2 border-t border-[#18181D]">
                    <span className="text-[10px] font-bold text-[#A0A0A7] uppercase font-heading flex items-center gap-1.5 mb-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#808088]" /> Não testado ({project.statePhoto.untested.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.statePhoto.untested.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#181820] border border-[#282832] text-[#A0A0A7] text-[11px]"
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
                      Fora do escopo na versão atual
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.statePhoto.outOfScope.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#141418] border border-[#202026] text-[#707078] text-[11px]"
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
                  AMBIENTES DO PROJETO ({projectEnvironments.length})
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#D8D8DC] font-mono-code font-bold">
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

      {/* SUB TAB 5: ATUALIZAÇÃO POR IA (CONSOLIDATED WORKSPACE) */}
      {activeSubTab === 'ia-update' && (
        <div className="space-y-8">
          {/* SECTION 1: GERADOR E EXPORTADOR DE PROMPT */}
          <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-5 hud-card-corners">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E84A32]" />
                  ATUALIZAÇÃO POR IA — PROMPT PADRONIZADO (SCHEMA 1.0)
                </h2>
                <p className="text-xs text-[#808088] mt-1 font-mono-code">
                  Gere o prompt para o ChatGPT ou Google AI Studio contendo o contexto completo do projeto para gerar o JSON de sincronização.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono-code px-2 py-1 rounded bg-[#181820] text-[#E84A32] border border-[#282830]">
                  SCHEMA 1.0
                </span>
              </div>
            </div>

            {/* Prompt Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleCopy(getProjectPrompt(project.id, false), 'base')}
                className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] hover:text-white text-xs font-bold font-heading flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>COPIAR PROMPT</span>
              </button>

              <button
                onClick={() => handleCopy(getProjectPrompt(project.id, true), 'context')}
                className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-2 shadow-[0_0_15px_rgba(232,74,50,0.4)] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>COPIAR PROMPT + CONTEXTO</span>
              </button>

              <button
                onClick={() => handleDownloadPrompt(true)}
                className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] text-xs font-bold font-heading flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>BAIXAR PROMPT .TXT</span>
              </button>

              <button
                onClick={() => setShowPromptModal(true)}
                className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#D8D8DC] text-xs font-bold font-heading flex items-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>VISUALIZAR PROMPT</span>
              </button>
            </div>

            {copySuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-700/70 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ✓ {copySuccess === 'context' ? 'Prompt + Contexto do projeto' : 'Prompt Base'} copiado para a área de transferência! Cole no chat da sua IA.
                </span>
              </div>
            )}

            {/* Collapsible Inline Prompt Preview */}
            <div className="pt-2">
              <button
                onClick={() => setShowPromptInlinePreview(!showPromptInlinePreview)}
                className="text-xs font-semibold text-[#808088] hover:text-[#D8D8DC] flex items-center gap-1.5 transition-colors font-mono-code"
              >
                <span>{showPromptInlinePreview ? '▼ Ocultar pré-visualização rápida do prompt' : '► Exibir pré-visualização rápida do prompt'}</span>
              </button>

              {showPromptInlinePreview && (
                <div className="mt-3 relative rounded-lg border border-[#232328] overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#141418] border-b border-[#232328] text-[11px] text-[#808088] font-mono-code">
                    <span>Snapshot do Contexto + Template de Instruções</span>
                    <span>codex-martis-project-update-schema-1.0.txt</span>
                  </div>
                  <pre className="p-4 bg-[#08080A] text-[11px] font-mono-code text-[#C5C5CB] overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed select-all">
                    {getProjectPrompt(project.id, true)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: IMPORTAR ATUALIZAÇÃO JSON (PATCH RUNNER) */}
          <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-6 hud-card-corners">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#E84A32]" />
                  IMPORTAR ATUALIZAÇÃO VIA JSON
                </h2>
                <p className="text-xs text-[#808088] mt-1 font-mono-code">
                  Cole o JSON retornado pela IA para validar as alterações, revisar o patch diff e sincronizar o estado do projeto.
                </p>
              </div>

              <button
                onClick={loadSampleJson}
                className="px-3.5 py-1.5 rounded-lg bg-[#181820] hover:bg-[#22222E] text-[#FF8570] border border-[#E84A32]/30 text-xs font-semibold font-heading self-start sm:self-auto transition-colors flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Carregar Exemplo de Teste</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    if (jsonValidationResult) setJsonValidationResult(null);
                  }}
                  placeholder="Cole aqui o JSON produzido pela IA seguindo o schema_version: '1.0'..."
                  className="w-full bg-[#070709] border border-[#232328] focus:border-[#E84A32] rounded-lg p-4 font-mono-code text-xs text-[#F2F2F3] placeholder-[#4E4E56] focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleValidateJson}
                  className="px-5 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading flex items-center gap-2 shadow-[0_0_15px_rgba(232,74,50,0.3)] transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>VALIDAR ATUALIZAÇÃO</span>
                </button>

                {jsonInput && (
                  <button
                    onClick={() => {
                      setJsonValidationResult(null);
                      setJsonInput('');
                    }}
                    className="px-4 py-2.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] hover:text-[#D8D8DC] text-xs font-medium font-heading transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Validation Errors State */}
            {jsonValidationResult && !jsonValidationResult.success && (
              <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold font-heading text-red-300">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>ERRO DE VALIDAÇÃO DO JSON:</span>
                </div>
                <p className="leading-relaxed font-mono-code pl-6">{jsonValidationResult.error}</p>
                <p className="text-[11px] text-red-300/70 pl-6">
                  Certifique-se de que o JSON é válido, segue o Schema 1.0 e não foi truncado.
                </p>
              </div>
            )}

            {/* Validation Success & Diff Preview Card */}
            {jsonValidationResult?.success && jsonValidationResult.diff && (
              <div className="p-6 rounded-xl bg-[#0F0807] border border-[#E84A32]/70 space-y-6 animate-in fade-in shadow-[0_0_30px_rgba(232,74,50,0.2)] hud-card-corners">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E84A32]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E84A32] animate-pulse" />
                    <span className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider">
                      PREVIEW DAS ALTERAÇÕES (PATCH DIFF)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {jsonValidationResult.diff.sanitized && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono-code font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        Tokens/Senhas Sanitizados
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono-code font-bold">
                      ✓ Schema 1.0 Válido
                    </span>
                  </div>
                </div>

                {/* Status Summary Banner */}
                {jsonValidationResult.diff.statusSummary && (
                  <div className="p-3.5 rounded-lg bg-[#180C0A] border border-[#2D1412] text-xs text-[#E0E0E6] space-y-1">
                    <span className="text-[10px] font-bold text-[#E84A32] uppercase font-heading">
                      RESUMO DA ATUALIZAÇÃO / OPERADOR:
                    </span>
                    <p className="leading-relaxed">{jsonValidationResult.diff.statusSummary}</p>
                  </div>
                )}

                {/* Diff Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Health Diff */}
                  <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] space-y-1">
                    <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                      Saúde do Projeto
                    </p>
                    <p className="text-[#D8D8DC] font-medium">
                      <span className="text-[#808088]">{jsonValidationResult.diff.health.current}</span>
                      {' → '}
                      <span className={jsonValidationResult.diff.health.changed ? 'text-emerald-400 font-bold' : 'text-[#D8D8DC]'}>
                        {jsonValidationResult.diff.health.new}
                      </span>
                      {jsonValidationResult.diff.health.changed && (
                        <span className="ml-2 text-[10px] text-emerald-400 font-mono-code">(Modificado)</span>
                      )}
                    </p>
                  </div>

                  {/* Progress Diff */}
                  <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] space-y-1">
                    <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                      Progresso Geral
                    </p>
                    <p className="text-[#D8D8DC] font-medium">
                      <span className="text-[#808088]">{jsonValidationResult.diff.progress.current}%</span>
                      {' → '}
                      <span className={jsonValidationResult.diff.progress.changed ? 'text-[#E84A32] font-bold' : 'text-[#D8D8DC]'}>
                        {jsonValidationResult.diff.progress.new}%
                      </span>
                      {jsonValidationResult.diff.progress.changed && (
                        <span className="ml-2 text-[10px] text-[#E84A32] font-mono-code">(Modificado)</span>
                      )}
                    </p>
                  </div>

                  {/* Nova Próxima Missão */}
                  <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-[#E84A32] uppercase font-heading">
                        Próxima Missão
                      </p>
                      {jsonValidationResult.diff.nextMission.changed && (
                        <span className="text-[10px] text-[#E84A32] font-mono-code">Nova missão definida</span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm">
                      {jsonValidationResult.diff.nextMission.new}
                    </p>
                    {jsonValidationResult.diff.nextMission.whyImportant && (
                      <p className="text-[11px] text-[#A0A0A7]">
                        <strong className="text-[#FF8570]">Importância:</strong> {jsonValidationResult.diff.nextMission.whyImportant}
                      </p>
                    )}
                    {jsonValidationResult.diff.nextMission.recommendedTool && (
                      <p className="text-[10px] text-[#808088] font-mono-code">
                        Ferramenta recomendada: <span className="text-white font-semibold">{jsonValidationResult.diff.nextMission.recommendedTool}</span>
                      </p>
                    )}
                  </div>

                  {/* Tarefas a Concluir */}
                  {jsonValidationResult.diff.completedTasks && jsonValidationResult.diff.completedTasks.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-2">
                      <p className="text-[10px] font-semibold text-emerald-400 uppercase font-heading flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tarefas a Marcar como Concluídas ({jsonValidationResult.diff.completedTasks.length})
                      </p>
                      <ul className="space-y-1.5 text-[#D8D8DC]">
                        {jsonValidationResult.diff.completedTasks.map((ct: any, i: number) => (
                          <li key={i} className="flex items-center justify-between p-2 rounded bg-[#0A0605] border border-[#20100E]">
                            <span className="font-semibold">{ct.title}</span>
                            {ct.matchedTaskId ? (
                              <span className="text-[10px] font-mono-code text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                                Vinculado à tarefa existente
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono-code text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                                Criará tarefa já concluída
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tarefas Atualizadas */}
                  {jsonValidationResult.diff.updatedTasks && jsonValidationResult.diff.updatedTasks.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-2">
                      <p className="text-[10px] font-semibold text-blue-400 uppercase font-heading flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Tarefas Existentes a Atualizar ({jsonValidationResult.diff.updatedTasks.length})
                      </p>
                      <ul className="space-y-1 text-[#D8D8DC]">
                        {jsonValidationResult.diff.updatedTasks.map((ut: any, i: number) => (
                          <li key={i} className="p-2 rounded bg-[#0A0605] border border-[#20100E]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{ut.title}</span>
                              <span className="text-[10px] text-blue-400 font-mono-code">{ut.matchedTaskId || 'ID correspondente'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-[#A0A0A7]">
                              {ut.changes.status && <span>Status → <strong className="text-white">{ut.changes.status}</strong></span>}
                              {ut.changes.priority && <span>Prioridade → <strong className="text-white">{ut.changes.priority}</strong></span>}
                              {ut.changes.type && <span>Tipo → <strong className="text-white">{ut.changes.type}</strong></span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Novas Tarefas */}
                  {jsonValidationResult.diff.newTasks && jsonValidationResult.diff.newTasks.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-2">
                      <p className="text-[10px] font-semibold text-[#FF8570] uppercase font-heading flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Novas Tarefas a Criar ({jsonValidationResult.diff.newTasks.length})
                      </p>
                      <ul className="space-y-1.5 text-[#D8D8DC]">
                        {jsonValidationResult.diff.newTasks.map((nt: any, i: number) => (
                          <li key={i} className="p-2 rounded bg-[#0A0605] border border-[#20100E] space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white">{nt.title}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#A0A0A7] font-mono-code">
                                  {nt.type || 'Melhoria'}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1C1C24] text-[#D8D8DC] font-mono-code font-bold">
                                  {nt.priority || 'Média'}
                                </span>
                              </div>
                            </div>
                            {nt.description && <p className="text-[11px] text-[#808088]">{nt.description}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Issues & Riscos */}
                  {jsonValidationResult.diff.issues && jsonValidationResult.diff.issues.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-2">
                      <p className="text-[10px] font-semibold text-amber-400 uppercase font-heading flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Issues e Riscos Detectados ({jsonValidationResult.diff.issues.length})
                      </p>
                      <ul className="space-y-1 text-[#D8D8DC]">
                        {jsonValidationResult.diff.issues.map((iss: any, i: number) => (
                          <li key={i} className="p-2 rounded bg-[#0A0605] border border-[#20100E] flex items-center justify-between">
                            <span>{iss.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono-code">
                              {iss.type || 'Bug'} • {iss.severity || 'Média'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Decisões Estratégicas */}
                  {jsonValidationResult.diff.decisions && jsonValidationResult.diff.decisions.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-1.5">
                      <p className="text-[10px] font-semibold text-purple-400 uppercase font-heading">
                        Decisões Registradas ({jsonValidationResult.diff.decisions.length})
                      </p>
                      <ul className="space-y-1.5 text-[#D8D8DC]">
                        {jsonValidationResult.diff.decisions.map((dec: any, i: number) => (
                          <li key={i} className="p-2 rounded bg-[#0A0605] border border-[#20100E] space-y-0.5">
                            <p className="font-bold text-white">{dec.title}</p>
                            {dec.reason && <p className="text-[11px] text-[#A0A0A7]">Motivo: {dec.reason}</p>}
                            {dec.impact && <p className="text-[11px] text-[#808088]">Impacto: {dec.impact}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mudanças Técnicas */}
                  {jsonValidationResult.diff.technicalChanges && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] md:col-span-2 space-y-1.5">
                      <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading">
                        Alterações Técnicas Informadas
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#C5C5CB]">
                        <div>
                          <strong className="text-[#808088] block text-[10px] uppercase">Arquivos Modificados:</strong>
                          <span>{jsonValidationResult.diff.technicalChanges.modified_files?.join(', ') || 'Nenhum'}</span>
                        </div>
                        <div>
                          <strong className="text-[#808088] block text-[10px] uppercase">Bibliotecas Adicionadas:</strong>
                          <span>{jsonValidationResult.diff.technicalChanges.added_libraries?.join(', ') || 'Nenhuma'}</span>
                        </div>
                        <div>
                          <strong className="text-[#808088] block text-[10px] uppercase">Configurações:</strong>
                          <span>{jsonValidationResult.diff.technicalChanges.configuration_changes?.join(', ') || 'Nenhuma'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commit & Repositório */}
                  {jsonValidationResult.diff.commit && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading flex items-center gap-1">
                          <GitCommit className="w-3.5 h-3.5 text-[#E84A32]" /> Commit
                        </p>
                        <span className="text-[9px] text-[#808088] font-mono-code">Informado pela atualização</span>
                      </div>
                      <p className="text-[#D8D8DC] font-mono-code font-bold">
                        {jsonValidationResult.diff.commit.hash}
                      </p>
                      {jsonValidationResult.diff.commit.message && (
                        <p className="text-[11px] text-[#A0A0A7]">{jsonValidationResult.diff.commit.message}</p>
                      )}
                    </div>
                  )}

                  {/* Deploy */}
                  {jsonValidationResult.diff.deploy && (
                    <div className="p-3.5 rounded-lg bg-[#140C0B] border border-[#2C1412] space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-[#808088] uppercase font-heading flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" /> Deploy
                        </p>
                        <span className="text-[9px] text-[#808088] font-mono-code">Informado pela atualização</span>
                      </div>
                      <p className="text-white font-semibold">
                        {jsonValidationResult.diff.deploy.performed ? '✓ Deploy Realizado' : 'Não realizado'}
                      </p>
                      <p className="text-[11px] text-[#A0A0A7]">
                        Ambiente: {jsonValidationResult.diff.deploy.environment || 'Produção'} ({jsonValidationResult.diff.deploy.platform || 'Vercel'})
                      </p>
                      {jsonValidationResult.diff.deploy.url && (
                        <p className="text-[10px] text-[#E84A32] font-mono-code truncate">{jsonValidationResult.diff.deploy.url}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Final Confirmation Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E84A32]/30">
                  <div className="text-xs text-[#808088]">
                    Apenas os campos informados no JSON serão atualizados (aplicação via PATCH seguro).
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setJsonValidationResult(null)}
                      className="px-4 py-2 rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#A0A0A7] hover:text-[#D8D8DC] text-xs font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleApplyJsonUpdate}
                      className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading uppercase shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>APLICAR ATUALIZAÇÃO</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMPT VIEWER MODAL */}
      <PromptViewerModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        title={`Prompt de Atualização: ${project.name}`}
        schemaName="Project Update Schema 1.0"
        promptContent={getProjectPrompt(project.id, false)}
        promptWithContext={getProjectPrompt(project.id, true)}
        downloadFilename={`codex-martis-project-update-${project.id}-${new Date().toISOString().slice(0, 10)}.txt`}
      />
    </div>
  );
};
