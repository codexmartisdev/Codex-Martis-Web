'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  PlayCircle,
  StopCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Code2,
  GitCommit,
  Layers,
  FileCheck,
  Plus,
  Target,
  Sparkles,
} from 'lucide-react';

interface SessionsViewProps {
  onOpenProject: (projectId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({ onOpenProject }) => {
  const {
    sessions,
    activeSession,
    projects,
    tasks,
    startSession,
    finishSession,
    cancelActiveSession,
  } = useStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Finish session form state
  const [workDone, setWorkDone] = useState<string>('');
  const [commitHash, setCommitHash] = useState<string>('');
  const [issuesFound, setIssuesFound] = useState<string>('');
  const [decisions, setDecisions] = useState<string>('');
  const [result, setResult] = useState<'Sucesso total' | 'Sucesso parcial' | 'Bloqueado por impedimento'>('Sucesso total');

  // Elapsed timer state for active session
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeSession) return;

    const startTime = new Date(activeSession.startedAt).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    const proj = projects.find((p) => p.id === selectedProjectId);
    const obj = customObjective || (selectedTaskId ? tasks.find((t) => t.id === selectedTaskId)?.title : proj?.nextTaskTitle) || 'Execução de melhorias';

    startSession(selectedProjectId, selectedTaskId || undefined, obj);
    setCustomObjective('');
    setSelectedTaskId('');
  };

  const handleFinishSession = (e: React.FormEvent) => {
    e.preventDefault();
    finishSession({
      workDone: workDone || 'Missão concluída conforme especificado.',
      commitHash: commitHash || undefined,
      issuesFound: issuesFound ? [issuesFound] : [],
      decisions: decisions ? [decisions] : [],
      result,
    });
    setWorkDone('');
    setCommitHash('');
    setIssuesFound('');
    setDecisions('');
  };

  const availableTasks = tasks.filter(
    (t) => t.projectId === selectedProjectId && t.status !== 'Concluída'
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
          SESSÕES
          <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
        </h1>
        <p className="text-xs text-[#808088] mt-1 font-mono-code">
          Histórico operacional e cockpit de execução de missões.
        </p>
      </div>

      {/* ACTIVE SESSION COCKPIT */}
      {activeSession ? (
        <div className="bg-[#120807] border-2 border-[#E84A32] rounded-xl p-6 relative overflow-hidden shadow-[0_0_35px_rgba(232,74,50,0.3)] hud-card-corners animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E84A32]/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#E84A32] animate-ping" />
              <div>
                <span className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider">
                  SESSÃO EM ANDAMENTO • #{activeSession.sessionNumber.toString().padStart(3, '0')}
                </span>
                <h2 className="text-xl font-bold font-heading text-[#F2F2F3]">
                  {activeSession.projectName}
                </h2>
              </div>
            </div>

            {/* Live Clock HUD Display */}
            <div className="bg-[#070709] border border-[#E84A32]/50 px-5 py-2 rounded-lg text-center font-mono-code shadow-inner">
              <span className="text-[10px] text-[#A0A0A7] block font-heading uppercase">
                TEMPO DECODIFICADO
              </span>
              <span className="text-2xl font-bold text-[#E84A32] tracking-wider">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Mission Objective */}
          <div className="py-4 space-y-2">
            <p className="text-[10px] font-bold text-[#FF7A59] uppercase tracking-wider font-heading">
              OBJETIVO DA MISSÃO:
            </p>
            <p className="text-sm font-semibold text-[#F2F2F3] bg-[#180A08] p-3 rounded-lg border border-[#2C1412]">
              {activeSession.objective}
            </p>
          </div>

          {/* Finish Session Form */}
          <form onSubmit={handleFinishSession} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                  O que foi executado nesta sessão:
                </label>
                <textarea
                  rows={2}
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  placeholder="Ex: Corrigido salvamento do Firestore, validada persistência..."
                  className="w-full bg-[#070709] border border-[#2A1614] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                  Decisões técnicas / Arquiteturais tomadas:
                </label>
                <textarea
                  rows={2}
                  value={decisions}
                  onChange={(e) => setDecisions(e.target.value)}
                  placeholder="Ex: Isolado módulo em client-side e reforçadas regras..."
                  className="w-full bg-[#070709] border border-[#2A1614] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                  Hash do Git Commit (opcional):
                </label>
                <div className="relative">
                  <GitCommit className="w-3.5 h-3.5 text-[#808088] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={commitHash}
                    onChange={(e) => setCommitHash(e.target.value)}
                    placeholder="ex: 7a8b9c0"
                    className="w-full bg-[#070709] border border-[#2A1614] rounded-lg pl-8 pr-3 py-2 text-xs font-mono-code text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                  Resultado da Sessão:
                </label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as any)}
                  className="w-full bg-[#070709] border border-[#2A1614] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                >
                  <option value="Sucesso total">Sucesso total</option>
                  <option value="Sucesso parcial">Sucesso parcial</option>
                  <option value="Bloqueado por impedimento">Bloqueado por impedimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                  Problemas encontrados (se houver):
                </label>
                <input
                  type="text"
                  value={issuesFound}
                  onChange={(e) => setIssuesFound(e.target.value)}
                  placeholder="Ex: Falha no CORS da rota X"
                  className="w-full bg-[#070709] border border-[#2A1614] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelActiveSession}
                className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] text-xs font-semibold"
              >
                Cancelar Sessão
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs font-heading uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all"
              >
                <StopCircle className="w-4 h-4" />
                <span>CONCLUIR SESSÃO & REGISTRAR</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* LAUNCH NEW SESSION CARD */
        <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4 hud-card-corners">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold font-heading text-[#E84A32] uppercase tracking-wider flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              INICIAR NOVA SESSÃO OPERACIONAL
            </h2>
            <span className="text-[10px] text-[#808088] font-mono-code">
              Nenhuma sessão ativa
            </span>
          </div>

          <form onSubmit={handleStartSession} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Projeto:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedTaskId('');
                }}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phase})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Vincular à Tarefa Existente (opcional):
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                <option value="">Usar Próxima Missão Padrão do Projeto</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.priority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Objetivo Específico Customizado (opcional):
              </label>
              <input
                type="text"
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                placeholder="Sobrescrever objetivo..."
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs font-heading uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.4)] transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>INICIAR SESSÃO AGORA</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SESSIONS LOG HISTORY TABLE */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
            HISTÓRICO DE SESSÕES EXECUTADAS ({sessions.length})
          </h2>
          <span className="text-[10px] text-[#808088] font-mono-code">Ordem cronológica</span>
        </div>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-lg bg-[#0E0E12] border border-[#1E1E24] hover:border-[#2C2C36] transition-all space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-code font-bold text-[#E84A32] px-2 py-0.5 rounded bg-[#180A08] border border-[#E84A32]/30">
                    SESSÃO #{s.sessionNumber.toString().padStart(3, '0')}
                  </span>
                  <span className="font-bold text-sm text-[#F2F2F3]">{s.projectName}</span>
                  <span className="text-[10px] text-[#808088] font-mono-code">
                    {s.startedAt.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {s.durationMinutes && (
                    <span className="text-[10px] text-[#A0A0A7] font-mono-code flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#66666D]" />
                      {s.durationMinutes} min
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-bold font-heading">
                    {s.result || 'Concluída'}
                  </span>
                </div>
              </div>

              {/* Objective */}
              <p className="font-semibold text-[#D8D8DC]">{s.objective}</p>

              {/* Work Done */}
              {s.workDone && (
                <p className="text-[#808088] text-[11px] leading-relaxed">
                  <span className="text-[#A0A0A7] font-medium">Entregas:</span> {s.workDone}
                </p>
              )}

              {/* Footer Meta: Commit & Decisions */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#181820] text-[10px] text-[#66666D]">
                {s.commitHash && (
                  <span className="font-mono-code bg-[#141418] px-2 py-0.5 rounded text-[#A0A0A7] flex items-center gap-1">
                    <GitCommit className="w-3 h-3 text-[#E84A32]" />
                    {s.commitHash}
                  </span>
                )}
                {s.decisions && s.decisions.length > 0 && (
                  <span>Decisão: {s.decisions[0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
