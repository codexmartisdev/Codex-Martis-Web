'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  Braces,
  ChevronRight,
  CircleDot,
  Command,
  Crosshair,
  Database,
  GitBranch,
  Network,
  Radio,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface CyberCommandDeckProps {
  onNavigateTab: (tab: string) => void;
  onOpenProject: (projectId: string) => void;
}

type ConsoleLine = {
  id: number;
  prefix: string;
  text: string;
  tone?: 'normal' | 'ok' | 'warn' | 'accent';
};

const NAV_ALIASES: Record<string, string> = {
  command: 'command',
  projects: 'projetos',
  projetos: 'projetos',
  tasks: 'tarefas',
  tarefas: 'tarefas',
  sessions: 'sessoes',
  sessoes: 'sessoes',
  history: 'historico',
  historico: 'historico',
  environments: 'ambientes',
  ambientes: 'ambientes',
  settings: 'configuracoes',
  configuracoes: 'configuracoes',
};

export const CyberCommandDeck: React.FC<CyberCommandDeckProps> = ({
  onNavigateTab,
  onOpenProject,
}) => {
  const {
    projects,
    tasks,
    history,
    activeSession,
    isFirestoreConnected,
    isFirestoreSyncing,
    getProjectNextMissionTitle,
  } = useStore();

  const focusProject = projects.find((project) => project.id === 'advodesk') || projects[0] || null;
  const [commandInput, setCommandInput] = useState('');
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([
    { id: 1, prefix: 'SYS', text: 'CYBER COMMAND INTERFACE ONLINE', tone: 'ok' },
    { id: 2, prefix: 'AUTH', text: 'OPERATOR CHANNEL VERIFIED', tone: 'ok' },
    { id: 3, prefix: 'TIP', text: 'type `help` to list internal commands', tone: 'normal' },
  ]);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'Concluída' && task.status !== 'Cancelada'),
    [tasks]
  );

  const appendLines = (lines: Omit<ConsoleLine, 'id'>[]) => {
    setConsoleLines((current) => {
      const startId = current.reduce((max, line) => Math.max(max, line.id), 0) + 1;
      return [...current, ...lines.map((line, index) => ({ ...line, id: startId + index }))].slice(-14);
    });
  };

  const executeInternalCommand = (raw: string) => {
    const normalized = raw.trim();
    if (!normalized) return;

    appendLines([{ prefix: 'CMD', text: `> ${normalized}`, tone: 'accent' }]);
    setCommandInput('');

    const [base, ...args] = normalized.toLowerCase().split(/\s+/);
    const argument = args.join(' ');

    if (base === 'clear') {
      setConsoleLines([]);
      return;
    }

    if (base === 'help') {
      appendLines([
        { prefix: 'HELP', text: 'status | projects | mission | events | go <module> | open <project> | clear' },
        { prefix: 'SAFE', text: 'commands operate only inside Codex UI; no operating-system shell is exposed', tone: 'ok' },
      ]);
      return;
    }

    if (base === 'status') {
      appendLines([
        {
          prefix: 'CORE',
          text: `${projects.length} project nodes / ${openTasks.length} open operations / ${activeSession ? 'mission active' : 'standby'}`,
        },
        {
          prefix: 'DATA',
          text: isFirestoreSyncing
            ? 'Firestore synchronization in progress'
            : isFirestoreConnected
              ? 'Firestore data link nominal'
              : 'Firestore data link acquiring',
          tone: isFirestoreConnected ? 'ok' : 'warn',
        },
      ]);
      return;
    }

    if (base === 'projects') {
      appendLines(
        projects.slice(0, 6).map((project) => ({
          prefix: 'NODE',
          text: `${project.identifier} :: ${project.name} :: ${project.progress}% :: ${project.status}`,
        }))
      );
      return;
    }

    if (base === 'mission') {
      appendLines([
        {
          prefix: activeSession ? 'LIVE' : 'NEXT',
          text: activeSession?.objective || (focusProject ? getProjectNextMissionTitle(focusProject) : 'No mission available'),
          tone: activeSession ? 'accent' : 'normal',
        },
      ]);
      return;
    }

    if (base === 'events') {
      const events = history.slice(0, 5);
      appendLines(
        events.length
          ? events.map((event) => ({ prefix: 'EVT', text: `${event.projectName || 'CODEX'} :: ${event.title}` }))
          : [{ prefix: 'EVT', text: 'No operational events indexed' }]
      );
      return;
    }

    if (base === 'go') {
      const target = NAV_ALIASES[argument];
      if (target) {
        appendLines([{ prefix: 'NAV', text: `Routing interface to ${target.toUpperCase()}`, tone: 'ok' }]);
        window.setTimeout(() => onNavigateTab(target), 120);
      } else {
        appendLines([{ prefix: 'ERR', text: `Unknown module: ${argument || '(empty)'}`, tone: 'warn' }]);
      }
      return;
    }

    if (base === 'open') {
      const target = projects.find(
        (project) =>
          project.id.toLowerCase() === argument ||
          project.identifier.toLowerCase() === argument ||
          project.name.toLowerCase() === argument
      );
      if (target) {
        appendLines([{ prefix: 'NODE', text: `Opening ${target.name}`, tone: 'ok' }]);
        window.setTimeout(() => onOpenProject(target.id), 120);
      } else {
        appendLines([{ prefix: 'ERR', text: `Project node not found: ${argument || '(empty)'}`, tone: 'warn' }]);
      }
      return;
    }

    appendLines([{ prefix: 'ERR', text: `Unknown internal command: ${base}. Type help.`, tone: 'warn' }]);
  };

  const consoleTone = (tone?: ConsoleLine['tone']) => {
    if (tone === 'ok') return 'text-emerald-400';
    if (tone === 'warn') return 'text-amber-400';
    if (tone === 'accent') return 'text-[#FF7A59]';
    return 'text-[#8A8A94]';
  };

  return (
    <section className="cyber-deck mt-6 border border-[#24242C] bg-[#070709]/88 rounded-xl overflow-hidden shadow-[0_0_42px_-24px_rgba(232,74,50,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#23232A] bg-[#09090C]/95">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-md border border-[#E84A32]/40 bg-[#160A08] flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-[#E84A32]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div>
            <div className="text-[11px] font-bold font-heading tracking-[0.18em] text-[#F2F2F3] uppercase">CYBER COMMAND DECK</div>
            <div className="text-[9px] font-mono-code text-[#5E5E68]">LOCAL INTERFACE // SAFE INTERNAL COMMAND LAYER</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono-code">
          <span className="px-2 py-1 rounded border border-emerald-800/40 bg-emerald-950/20 text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> NOMINAL
          </span>
          <span className="px-2 py-1 rounded border border-[#2A2A32] text-[#686872]">NODE CM-01</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative border-b xl:border-b-0 xl:border-r border-[#222229] min-h-[310px] bg-[#050507]/80 overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-[10px] font-mono-code text-[#70707A] uppercase tracking-wider">
                <Braces className="w-3.5 h-3.5 text-[#E84A32]" /> System Console
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono-code text-[#505058]">
                <CircleDot className="w-3 h-3 text-emerald-400" /> READ/ROUTE MODE
              </span>
            </div>

            <div className="h-[205px] overflow-y-auto pr-2 space-y-1.5 font-mono-code text-[10px] terminal-scanlines">
              {consoleLines.length === 0 && <div className="text-[#4D4D56]">console buffer cleared_</div>}
              {consoleLines.map((line) => (
                <div key={line.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#E84A32]/75 w-9 shrink-0">[{line.prefix}]</span>
                  <span className={consoleTone(line.tone)}>{line.text}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                executeInternalCommand(commandInput);
              }}
              className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#2A2A32] bg-[#09090C]/95 focus-within:border-[#E84A32]/60 focus-within:shadow-[0_0_20px_-8px_rgba(232,74,50,0.45)] transition-all"
            >
              <Command className="w-3.5 h-3.5 text-[#E84A32]" />
              <span className="font-mono-code text-[11px] text-[#E84A32]">&gt;</span>
              <input
                value={commandInput}
                onChange={(event) => setCommandInput(event.target.value)}
                placeholder="help | status | projects | mission | go tarefas | open emprovium"
                className="flex-1 bg-transparent outline-none text-[11px] font-mono-code text-[#D8D8DC] placeholder:text-[#44444D]"
              />
              <span className="hidden sm:inline text-[9px] font-mono-code text-[#4F4F58]">ENTER</span>
            </form>
          </div>
        </div>

        <div className="p-4 bg-[#08080A]/90 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-[10px] font-mono-code text-[#70707A] uppercase tracking-wider">
                <Network className="w-3.5 h-3.5 text-[#E84A32]" /> Node Matrix
              </span>
              <span className="text-[9px] font-mono-code text-[#4D4D56]">{projects.length} LINKED</span>
            </div>
            <div className="space-y-2.5">
              {projects.slice(0, 5).map((project, index) => (
                <button
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="group w-full flex items-center gap-3 text-left"
                >
                  <div className="relative w-7 h-7 rounded-full border border-[#34343D] bg-[#0D0D11] flex items-center justify-center shrink-0 group-hover:border-[#E84A32]/60 transition-colors">
                    <span className="text-[9px] font-mono-code text-[#E84A32]">{String(index + 1).padStart(2, '0')}</span>
                    {index < projects.slice(0, 5).length - 1 && <span className="absolute top-full h-3 w-px bg-gradient-to-b from-[#E84A32]/35 to-[#25252D]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-[#CFCFD5] truncate group-hover:text-white">{project.name}</span>
                      <span className="text-[9px] font-mono-code text-[#666670]">{project.progress}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-[#17171C] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7D1A12] to-[#E84A32] shadow-[0_0_6px_rgba(232,74,50,0.4)]"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#44444C] group-hover:text-[#E84A32]" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#202026]">
            <div className="p-2.5 rounded-lg border border-[#222229] bg-[#0B0B0E]">
              <Database className={`w-3.5 h-3.5 mb-2 ${isFirestoreConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="text-[8px] font-mono-code text-[#565660] uppercase">Data Link</div>
              <div className="text-[10px] font-mono-code text-[#C6C6CC] mt-0.5">{isFirestoreSyncing ? 'SYNCING' : isFirestoreConnected ? 'NOMINAL' : 'ACQUIRING'}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-[#222229] bg-[#0B0B0E]">
              <Crosshair className={`w-3.5 h-3.5 mb-2 ${activeSession ? 'text-[#E84A32]' : 'text-[#666670]'}`} />
              <div className="text-[8px] font-mono-code text-[#565660] uppercase">Mission</div>
              <div className="text-[10px] font-mono-code text-[#C6C6CC] mt-0.5">{activeSession ? `#${activeSession.sessionNumber.toString().padStart(3, '0')} LIVE` : 'STANDBY'}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-[#222229] bg-[#0B0B0E]">
              <GitBranch className="w-3.5 h-3.5 mb-2 text-[#E84A32]" />
              <div className="text-[8px] font-mono-code text-[#565660] uppercase">Project Nodes</div>
              <div className="text-[10px] font-mono-code text-[#C6C6CC] mt-0.5">{projects.length} INDEXED</div>
            </div>
            <div className="p-2.5 rounded-lg border border-[#222229] bg-[#0B0B0E]">
              <Activity className="w-3.5 h-3.5 mb-2 text-amber-400" />
              <div className="text-[8px] font-mono-code text-[#565660] uppercase">Open Ops</div>
              <div className="text-[10px] font-mono-code text-[#C6C6CC] mt-0.5">{openTasks.length} ACTIVE</div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#202026]">
            <div className="flex items-center gap-2 text-[9px] font-mono-code text-[#5A5A64] mb-2">
              <Radio className="w-3 h-3 text-[#E84A32]" /> EVENT STREAM
            </div>
            <div className="space-y-1.5">
              {history.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-start gap-2 text-[9px] font-mono-code">
                  <span className="text-[#E84A32]">›</span>
                  <span className="text-[#70707A] truncate">{event.title}</span>
                </div>
              ))}
              {history.length === 0 && <div className="text-[9px] font-mono-code text-[#484850]">no events in stream</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
