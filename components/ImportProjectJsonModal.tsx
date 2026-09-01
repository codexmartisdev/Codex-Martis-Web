'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  ProjectImportSchema1,
  ProjectStatus,
  ProjectHealth,
  TaskPriority,
  TaskType,
} from '@/lib/types';
import {
  DEFAULT_PROJECT_IMPORT_PROMPT,
} from '@/lib/constants/prompts';
import {
  getServiceConfigurationLabel,
  mapSeverityToTaskPriority,
} from '@/lib/projectImport';
import { PromptViewerModal } from './PromptViewerModal';
import {
  X,
  Code2,
  Copy,
  Download,
  Eye,
  Check,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  FolderKanban,
  Edit3,
  Rocket,
  Plus,
  Target,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface ImportProjectJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
  onOpenProject: (projectId: string) => void;
}

export const ImportProjectJsonModal: React.FC<ImportProjectJsonModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onOpenProject,
}) => {
  const { validateProjectImport, createProjectFromImport } = useStore();

  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ProjectImportSchema1 | null>(null);
  const [rawJsonString, setRawJsonString] = useState<string>('');
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    existingProject?: any;
    reason?: string;
  } | null>(null);
  const [hasRemovedSecrets, setHasRemovedSecrets] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPromptViewerOpen, setIsPromptViewerOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setJsonInput('');
    setValidationError(null);
    setParsedData(null);
    setRawJsonString('');
    setDuplicateWarning(null);
    setHasRemovedSecrets(false);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCopyPrompt = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(DEFAULT_PROJECT_IMPORT_PROMPT);
        setCopyFeedback('Prompt copiado.');
        setTimeout(() => setCopyFeedback(null), 3000);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = DEFAULT_PROJECT_IMPORT_PROMPT;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopyFeedback('Prompt copiado.');
        setTimeout(() => setCopyFeedback(null), 3000);
      }
    } catch {
      setCopyFeedback('Não foi possível copiar automaticamente.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([DEFAULT_PROJECT_IMPORT_PROMPT], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codex-martis-project-import-schema-1.0.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = () => {
    setValidationError(null);
    setDuplicateWarning(null);

    const result = validateProjectImport(jsonInput);
    if (!result.success || !result.parsedData) {
      setValidationError(result.error || 'JSON inválido.');
      setParsedData(null);
      return;
    }

    setParsedData(result.parsedData);
    setRawJsonString(result.rawJsonString || jsonInput);
    setHasRemovedSecrets(Boolean(result.hasRemovedSecrets));
    if (result.duplicateWarning && result.duplicateWarning.isDuplicate) {
      setDuplicateWarning(result.duplicateWarning);
    }
  };

  const handleConfirmCreation = () => {
    if (!parsedData) return;
    setIsSubmitting(true);

    const result = createProjectFromImport(parsedData, rawJsonString);
    if (result.success && result.projectId) {
      onCreated(result.projectId);
      handleClose();
    } else {
      setValidationError(result.error || 'Falha ao criar projeto.');
      setIsSubmitting(false);
    }
  };

  // Status and Health Helpers
  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'producao':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
            PRODUÇÃO
          </span>
        );
      case 'desenvolvimento':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/60 text-blue-300 border border-blue-800/50">
            DESENVOLVIMENTO
          </span>
        );
      case 'planejamento':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
            PLANEJAMENTO
          </span>
        );
      case 'teste':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950/60 text-purple-300 border border-purple-800/50">
            TESTE
          </span>
        );
      case 'pausado':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/60 text-amber-300 border border-amber-800/50">
            PAUSADO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300">
            {status || 'NÃO INFORMADO'}
          </span>
        );
    }
  };

  const getHealthBadge = (health?: string | null) => {
    switch (health) {
      case 'saudavel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-heading">
            <CheckCircle2 className="w-3 h-3" />
            SAUDÁVEL
          </span>
        );
      case 'atencao':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50 font-heading">
            <AlertTriangle className="w-3 h-3" />
            ATENÇÃO
          </span>
        );
      case 'bloqueado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/50 font-heading">
            <AlertTriangle className="w-3 h-3" />
            BLOQUEADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 font-heading">
            <Clock className="w-3 h-3" />
            NÃO AVALIADO
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-4xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1C1C22]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#141418] border border-[#282832] flex items-center justify-center text-[#E84A32]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-[#F2F2F3] uppercase tracking-wider flex items-center gap-2">
                  IMPORTAR PROJETO
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#E84A32] font-mono-code border border-[#282832]">
                    SCHEMA 1.0
                  </span>
                </h2>
                <p className="text-xs text-[#808088] mt-0.5">
                  Crie automaticamente a estrutura inicial de um projeto a partir de uma análise realizada por IA.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-[#808088] hover:text-[#F2F2F3] p-1.5 rounded-lg hover:bg-[#181820] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Prompt Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#1C1C22] bg-[#08080A] -mx-6 px-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3] font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>COPIAR PROMPT DE ANÁLISE</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3] font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>BAIXAR PROMPT .TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPromptViewerOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#F2F2F3] font-bold font-heading text-[11px] tracking-wider uppercase flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-[#E84A32]" />
                <span>VISUALIZAR PROMPT</span>
              </button>
            </div>

            {copyFeedback && (
              <span className="text-[11px] font-mono-code text-emerald-400 animate-in fade-in">
                ✓ {copyFeedback}
              </span>
            )}
          </div>

          {/* Modal Main Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Step 1: Input JSON (when no preview or when user wants to change JSON) */}
            {!parsedData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold font-heading text-[#C5C5CB] uppercase tracking-wider">
                    COLE O JSON GERADO PELA IA
                  </label>
                  <span className="text-[10px] text-[#808088] font-mono-code">
                    Schema: Codex Martis Project Import Schema 1.0
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={12}
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder={`{\n  "schema_version": "1.0",\n  "import_type": "project_creation",\n  "project": {\n    "name": "Nome do Projeto",\n    ...\n  }\n}`}
                    className="w-full bg-[#070709] border border-[#232328] rounded-xl p-4 text-xs font-mono-code text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none leading-relaxed resize-y"
                  />
                </div>

                {/* Validation Error Banner */}
                {validationError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold font-heading uppercase text-[11px]">Falha na validação do JSON</p>
                      <p className="text-[11px] mt-0.5 text-red-200">{validationError}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#66666D]">
                    A IA deve analisar o repositório externamente e gerar a fotografia técnica.
                  </span>
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!jsonInput.trim()}
                    className="px-5 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] disabled:opacity-40 disabled:hover:bg-[#E84A32] text-white font-bold text-xs font-heading tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all"
                  >
                    <span>VALIDAR JSON</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preview & Editing Screen (when parsedData is available) */}
            {parsedData && (
              <div className="space-y-6 animate-in fade-in">
                {/* Removed secrets notice */}
                {hasRemovedSecrets && (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Conteúdo potencialmente sensível removido durante a importação.</span>
                  </div>
                )}

                {/* Duplicate Project Warning */}
                {duplicateWarning?.isDuplicate && (
                  <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-700/80 text-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold font-heading uppercase text-amber-300">
                          POSSÍVEL PROJETO DUPLICADO
                        </h4>
                        <p className="text-xs mt-1 text-amber-200">
                          {duplicateWarning.reason || 'Já existe um projeto correspondente cadastrado no sistema.'}
                        </p>
                        {duplicateWarning.existingProject && (
                          <p className="text-[11px] font-mono-code text-amber-400/90 mt-1">
                            Projeto existente: <strong>{duplicateWarning.existingProject.name}</strong> ({duplicateWarning.existingProject.identifier})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-xs font-bold font-heading text-[#C5C5CB] transition-colors"
                      >
                        CANCELAR
                      </button>

                      {duplicateWarning.existingProject && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenProject(duplicateWarning.existingProject.id);
                            handleClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold font-heading text-xs uppercase flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ABRIR PROJETO EXISTENTE</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE A: PREVIEW VIEW */}
                {!isEditing ? (
                  <div className="space-y-6">
                    {/* Project Identification Banner */}
                    <div className="bg-[#070709] border border-[#232328] rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E84A32]/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold font-mono-code text-[#E84A32] tracking-wider uppercase">
                            PRÉVIA DO PROJETO
                          </span>
                          <h3 className="text-xl font-bold font-heading text-[#F2F2F3]">
                            {parsedData.project.name}
                          </h3>
                          <p className="text-xs text-[#808088] max-w-2xl leading-relaxed">
                            {parsedData.project.description || parsedData.context_summary || 'Sem descrição informada.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(parsedData.project.project_status)}
                          {getHealthBadge(parsedData.project.project_health)}
                        </div>
                      </div>

                      {/* Key Attributes Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1C1C22] text-xs">
                        <div>
                          <span className="text-[10px] text-[#66666D] block font-heading uppercase">TIPO</span>
                          <span className="text-[#F2F2F3] font-medium">{parsedData.project.type || 'Sistema Web'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block font-heading uppercase">FASE</span>
                          <span className="text-[#F2F2F3] font-medium">{parsedData.project.current_phase || 'Beta Solo'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block font-heading uppercase">PROGRESSO</span>
                          <span className="text-[#F2F2F3] font-medium">
                            {typeof parsedData.project.progress === 'number'
                              ? `${parsedData.project.progress}%`
                              : 'Não informado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block font-heading uppercase">OBJETIVO DA FASE</span>
                          <span className="text-[#F2F2F3] font-medium line-clamp-1">
                            {parsedData.project.current_objective || 'Desenvolvimento da versão inicial'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Repository Details Card */}
                    <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                        <FolderKanban className="w-4 h-4" />
                        REPOSITÓRIO & AMBIENTE ANALISADO
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#66666D] block">Repositório:</span>
                          <span className="text-[#F2F2F3] font-mono-code font-bold truncate block">
                            {parsedData.repository?.owner && parsedData.repository?.name
                              ? `${parsedData.repository.owner}/${parsedData.repository.name}`
                              : parsedData.source?.repository_name || 'Não informado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block">Branch:</span>
                          <span className="text-[#F2F2F3] font-mono-code">
                            {parsedData.source?.branch_analyzed || parsedData.repository?.default_branch || 'main'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block">Commit Analisado:</span>
                          <span className="text-[#F2F2F3] font-mono-code">
                            {parsedData.source?.commit_analyzed || 'Não informado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#66666D] block">Framework / Stack:</span>
                          <span className="text-[#F2F2F3]">
                            {parsedData.repository?.framework || 'Next.js / Node'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Card */}
                    {parsedData.tech_stack && (
                      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          STACK DETECTADA
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          {parsedData.tech_stack.frontend && parsedData.tech_stack.frontend.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Frontend</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.frontend.map((f, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedData.tech_stack.backend && parsedData.tech_stack.backend.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Backend</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.backend.map((b, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedData.tech_stack.database && parsedData.tech_stack.database.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Database</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.database.map((d, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedData.tech_stack.authentication && parsedData.tech_stack.authentication.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Authentication</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.authentication.map((a, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedData.tech_stack.hosting && parsedData.tech_stack.hosting.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Hosting</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.hosting.map((h, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedData.tech_stack.email && parsedData.tech_stack.email.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#808088] font-bold block uppercase">Email</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parsedData.tech_stack.email.map((e, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#181820] text-[#D8D8DC] border border-[#232328]">
                                    {e}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Current State Photography */}
                    {parsedData.current_state && (
                      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          ESTADO ATUAL DO PROJETO
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Working */}
                          <div className="p-3 rounded-lg bg-[#070709] border border-emerald-950/40">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 font-heading">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              FUNCIONANDO
                            </span>
                            <ul className="mt-2 space-y-1 text-[#C5C5CB]">
                              {parsedData.current_state.working && parsedData.current_state.working.length > 0 ? (
                                parsedData.current_state.working.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                    <span className="text-emerald-500">✓</span>
                                    <span>{item}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-[#66666D] text-[11px] italic">Nenhum item listado.</li>
                              )}
                            </ul>
                          </div>

                          {/* Partially Working */}
                          <div className="p-3 rounded-lg bg-[#070709] border border-amber-950/40">
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 font-heading">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              PARCIALMENTE FUNCIONANDO
                            </span>
                            <ul className="mt-2 space-y-1 text-[#C5C5CB]">
                              {parsedData.current_state.partially_working && parsedData.current_state.partially_working.length > 0 ? (
                                parsedData.current_state.partially_working.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                    <span className="text-amber-500">!</span>
                                    <span>{item}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-[#66666D] text-[11px] italic">Nenhum item listado.</li>
                              )}
                            </ul>
                          </div>

                          {/* Not Working */}
                          <div className="p-3 rounded-lg bg-[#070709] border border-red-950/40">
                            <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 font-heading">
                              <X className="w-3.5 h-3.5" />
                              NÃO FUNCIONANDO
                            </span>
                            <ul className="mt-2 space-y-1 text-[#C5C5CB]">
                              {parsedData.current_state.not_working && parsedData.current_state.not_working.length > 0 ? (
                                parsedData.current_state.not_working.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                    <span className="text-red-500">✕</span>
                                    <span>{item}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-[#66666D] text-[11px] italic">Nenhum item listado.</li>
                              )}
                            </ul>
                          </div>

                          {/* Untested */}
                          <div className="p-3 rounded-lg bg-[#070709] border border-[#232328]">
                            <span className="text-[11px] font-bold text-[#808088] flex items-center gap-1.5 font-heading">
                              <Clock className="w-3.5 h-3.5" />
                              NÃO TESTADO
                            </span>
                            <ul className="mt-2 space-y-1 text-[#C5C5CB]">
                              {parsedData.current_state.not_tested && parsedData.current_state.not_tested.length > 0 ? (
                                parsedData.current_state.not_tested.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                    <span className="text-[#66666D]">?</span>
                                    <span>{item}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-[#66666D] text-[11px] italic">Nenhum item listado.</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detected Services */}
                    {parsedData.detected_services && parsedData.detected_services.length > 0 && (
                      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          SERVIÇOS & AMBIENTES DETECTADOS
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {parsedData.detected_services.map((ds, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[#070709] border border-[#1C1C22] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#F2F2F3] font-heading">{ds.service}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-[#141418] text-[#808088] border border-[#232328] font-mono-code uppercase font-semibold">
                                  {getServiceConfigurationLabel(ds.configuration_status)}
                                </span>
                              </div>
                              {ds.evidence && (
                                <p className="text-[10px] text-[#66666D] italic">
                                  Evidência: {ds.evidence}
                                </p>
                              )}
                              <p className="text-[9px] text-[#4A4A52] font-mono-code pt-1">
                                Fonte da informação: Análise de repositório por IA
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Initial Tasks & Issues */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Initial Tasks */}
                      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                            TAREFAS INICIAIS ({parsedData.initial_tasks?.length || 0})
                          </h4>
                          <span className="text-[10px] text-[#808088] font-mono-code">Serão criadas</span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {parsedData.initial_tasks && parsedData.initial_tasks.length > 0 ? (
                            parsedData.initial_tasks.map((it, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-[#070709] border border-[#1C1C22] text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-[#F2F2F3] line-clamp-1">{it.title}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#181820] text-[#E84A32] font-mono-code uppercase shrink-0">
                                    {it.priority || 'Média'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#66666D] italic">Nenhuma tarefa inicial informada.</p>
                          )}
                        </div>
                      </div>

                      {/* Issues */}
                      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
                            PROBLEMAS IDENTIFICADOS ({parsedData.issues?.length || 0})
                          </h4>
                          <span className="text-[10px] text-[#E84A32] font-mono-code">→ Tarefas de Auditoria</span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {parsedData.issues && parsedData.issues.length > 0 ? (
                            parsedData.issues.map((iss, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-[#070709] border border-[#1C1C22] text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-[#F2F2F3] line-clamp-1">{iss.title}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 font-mono-code uppercase shrink-0">
                                    {iss.severity || 'Média'}
                                  </span>
                                </div>
                                {iss.description && (
                                  <p className="text-[10px] text-[#808088] mt-1 line-clamp-1">{iss.description}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#66666D] italic">Nenhum problema identificado.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Next Action / Mission */}
                    {parsedData.next_action && (
                      <div className="bg-[#140806] border border-[#E84A32]/40 rounded-xl p-4 space-y-2">
                        <span className="text-[10px] font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5" />
                          PRÓXIMA MISSÃO RECOMENDADA
                        </span>
                        <h4 className="text-sm font-bold text-[#F2F2F3]">
                          {parsedData.next_action.title}
                        </h4>
                        {parsedData.next_action.reason && (
                          <p className="text-xs text-[#C5C5CB] leading-relaxed">
                            {parsedData.next_action.reason}
                          </p>
                        )}
                        {parsedData.next_action.recommended_tool && (
                          <div className="pt-1 flex items-center gap-2 text-[11px] font-mono-code text-[#808088]">
                            <span>Ferramenta recomendada:</span>
                            <span className="text-[#F2F2F3] font-bold">{parsedData.next_action.recommended_tool}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODE B: EDIT BEFORE CREATING */
                  <div className="space-y-4 bg-[#070709] border border-[#232328] rounded-xl p-5 animate-in fade-in text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1C1C22]">
                      <h3 className="text-sm font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        EDITAR DADOS ANTES DE CRIAR O PROJETO
                      </h3>
                      <span className="text-[10px] text-[#808088]">Ajuste as interpretações da IA</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Nome do Projeto *
                        </label>
                        <input
                          type="text"
                          value={parsedData.project.name}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: { ...parsedData.project, name: e.target.value },
                            })
                          }
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Identifier */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Identificador / Código
                        </label>
                        <input
                          type="text"
                          value={parsedData.project.identifier || ''}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: { ...parsedData.project, identifier: e.target.value },
                            })
                          }
                          placeholder="Ex: advodesk"
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs font-mono-code text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Tipo de Projeto
                        </label>
                        <input
                          type="text"
                          value={parsedData.project.type || ''}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: { ...parsedData.project, type: e.target.value },
                            })
                          }
                          placeholder="Ex: Sistema Web"
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Current Phase */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Fase Atual
                        </label>
                        <input
                          type="text"
                          value={parsedData.project.current_phase || ''}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: { ...parsedData.project, current_phase: e.target.value },
                            })
                          }
                          placeholder="Ex: Beta Solo"
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Status
                        </label>
                        <select
                          value={parsedData.project.project_status || 'desenvolvimento'}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: {
                                ...parsedData.project,
                                project_status: e.target.value as ProjectStatus,
                              },
                            })
                          }
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        >
                          <option value="desenvolvimento">Desenvolvimento</option>
                          <option value="planejamento">Planejamento</option>
                          <option value="teste">Teste</option>
                          <option value="producao">Produção</option>
                          <option value="pausado">Pausado</option>
                          <option value="encerrado">Encerrado</option>
                        </select>
                      </div>

                      {/* Health */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Saúde do Projeto
                        </label>
                        <select
                          value={parsedData.project.project_health || 'nao_avaliado'}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: {
                                ...parsedData.project,
                                project_health: e.target.value as ProjectHealth,
                              },
                            })
                          }
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        >
                          <option value="saudavel">Saudável</option>
                          <option value="atencao">Atenção</option>
                          <option value="bloqueado">Bloqueado</option>
                          <option value="nao_avaliado">Não avaliado</option>
                        </select>
                      </div>

                      {/* Progress */}
                      <div>
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Progresso (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={parsedData.project.progress ?? 0}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: {
                                ...parsedData.project,
                                progress: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Objective */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-[#C5C5CB] mb-1 font-heading">
                          Objetivo da Fase
                        </label>
                        <textarea
                          rows={2}
                          value={parsedData.project.current_objective || ''}
                          onChange={(e) =>
                            setParsedData({
                              ...parsedData,
                              project: { ...parsedData.project, current_objective: e.target.value },
                            })
                          }
                          className="w-full bg-[#0C0C0E] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                        />
                      </div>

                      {/* Next Mission Edit */}
                      <div className="sm:col-span-2 p-3 bg-[#0C0C0E] border border-[#282832] rounded-lg space-y-3">
                        <span className="text-[10px] font-bold font-heading text-[#E84A32] uppercase">
                          Próxima Missão
                        </span>
                        <div>
                          <label className="block text-[10px] text-[#808088] mb-1">Título da Próxima Ação</label>
                          <input
                            type="text"
                            value={parsedData.next_action?.title || ''}
                            onChange={(e) =>
                              setParsedData({
                                ...parsedData,
                                next_action: {
                                  title: e.target.value,
                                  description: parsedData.next_action?.description || null,
                                  priority: parsedData.next_action?.priority || 'alta',
                                  recommended_tool: parsedData.next_action?.recommended_tool || null,
                                  reason: parsedData.next_action?.reason || null,
                                },
                              })
                            }
                            className="w-full bg-[#070709] border border-[#232328] rounded px-2.5 py-1.5 text-xs text-[#F2F2F3]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#808088] mb-1">Motivo / Importância</label>
                          <input
                            type="text"
                            value={parsedData.next_action?.reason || ''}
                            onChange={(e) =>
                              setParsedData({
                                ...parsedData,
                                next_action: {
                                  title: parsedData.next_action?.title || '',
                                  description: parsedData.next_action?.description || null,
                                  priority: parsedData.next_action?.priority || 'alta',
                                  recommended_tool: parsedData.next_action?.recommended_tool || null,
                                  reason: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-[#070709] border border-[#232328] rounded px-2.5 py-1.5 text-xs text-[#F2F2F3]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1C1C22]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#808088] hover:text-[#F2F2F3] text-xs font-bold font-heading uppercase tracking-wider transition-colors"
                    >
                      CANCELAR / COLAR OUTRO
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#282832] text-[#C5C5CB] hover:text-[#F2F2F3] text-xs font-bold font-heading uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#E84A32]" />
                      <span>{isEditing ? 'VER PRÉVIA' : 'EDITAR ANTES DE CRIAR'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCreation}
                    disabled={isSubmitting || !parsedData.project.name.trim()}
                    className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] disabled:opacity-50 text-white font-bold text-xs font-heading tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? 'CRIANDO ENTIDADES...' : 'CRIAR PROJETO'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Standard Prompt Viewer Modal */}
      <PromptViewerModal
        isOpen={isPromptViewerOpen}
        onClose={() => setIsPromptViewerOpen(false)}
        title="Prompt de Análise Inicial de Repositório"
        schemaName="Project Import Schema 1.0"
        promptContent={DEFAULT_PROJECT_IMPORT_PROMPT}
        downloadFilename="codex-martis-project-import-schema-1.0.txt"
      />
    </>
  );
};
