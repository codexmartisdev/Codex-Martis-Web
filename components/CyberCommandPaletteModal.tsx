'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  CheckSquare,
  Command,
  FolderKanban,
  Search,
  ShieldCheck,
  SquareTerminal,
  Terminal,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface CyberCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

const NAV_COMMANDS: Record<string, string> = {
  command: 'command',
  cockpit: 'command',
  projetos: 'projetos',
  projects: 'projetos',
  tarefas: 'tarefas',
  tasks: 'tarefas',
  sessoes: 'sessoes',
  sessions: 'sessoes',
  historico: 'historico',
  history: 'historico',
  ambientes: 'ambientes',
  environments: 'ambientes',
  configuracoes: 'configuracoes',
  settings: 'configuracoes',
};

export const CyberCommandPaletteModal: React.FC<CyberCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNavigateTab,
  onOpenNewTask,
  onOpenNewProject,
}) => {
  const { projects, tasks } = useStore();
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('COMMAND CHANNEL READY');

  useEffect(() => {
    if (!isOpen) return;
    setFeedback('COMMAND CHANNEL READY');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.replace(/^>\s*/, '').trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    if (!cleanQuery || cleanQuery.startsWith('go ') || cleanQuery.startsWith('abrir ') || cleanQuery.startsWith('open ')) {
      return projects.slice(0, 6);
    }
    return projects
      .filter((project) =>
        `${project.name} ${project.identifier} ${project.phase}`.toLowerCase().includes(cleanQuery)
      )
      .slice(0, 6);
  }, [cleanQuery, projects]);

  const filteredTasks = useMemo(() => {
    if (!cleanQuery || cleanQuery.length < 2) return [];
    return tasks
      .filter((task) => `${task.title} ${task.projectName}`.toLowerCase().includes(cleanQuery))
      .slice(0, 4);
  }, [cleanQuery, tasks]);

  const runCommand = () => {
    const command = cleanQuery;
    if (!command) return;

    if (NAV_COMMANDS[command]) {
      setFeedback(`ROUTING > ${NAV_COMMANDS[command].toUpperCase()}`);
      onNavigateTab(NAV_COMMANDS[command]);
      onClose();
      return;
    }

    if (command.startsWith('go ')) {
      const target = NAV_COMMANDS[command.slice(3).trim()];
      if (target) {
        setFeedback(`ROUTING > ${target.toUpperCase()}`);
        onNavigateTab(target);
        onClose();
        return;
      }
    }

    if (command === 'nova tarefa' || command === 'new task' || command === 'task new') {
      onOpenNewTask();
      onClose();
      return;
    }

    if (command === 'novo projeto' || command === 'new project' || command === 'project new') {
      onOpenNewProject();
      onClose();
      return;
    }

    const openMatch = command.match(/^(?:abrir|open)\s+(.+)$/);
    if (openMatch) {
      const name = openMatch[1];
      const project = projects.find(
        (item) =>
          item.name.toLowerCase() === name ||
          item.identifier.toLowerCase() === name ||
          item.id.toLowerCase() === name
      );
      if (project) {
        onSelectProject(project.id);
        onClose();
        return;
      }
      setFeedback(`NODE NOT FOUND // ${name.toUpperCase()}`);
      return;
    }

    if (filteredProjects.length === 1) {
      onSelectProject(filteredProjects[0].id);
      onClose();
      return;
    }

    setFeedback('NO DIRECT COMMAND MATCH // SELECT RESULT BELOW');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/88 backdrop-blur-md z-50 flex items-start justify-center pt-[12vh] p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.975, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: -5 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-2xl w-full rounded-xl border border-[#E84A32]/35 bg-[#070709]/96 shadow-[0_0_80px_-24px_rgba(232,74,50,0.55)] overflow-hidden hud-card-corners"
          >
            <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

            <div className="relative flex items-center justify-between px-4 py-2.5 border-b border-[#24242C] bg-[#0A0809]/96 font-mono-code">
              <div className="flex items-center gap-2 text-[#FF7A59]">
                <SquareTerminal className="w-3.5 h-3.5" />
                <span className="text-[10px] tracking-[0.16em] font-semibold">CODEX://COMMAND-INTERFACE</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-[#5D5D67]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                INTERNAL ROUTE ONLY
              </div>
            </div>

            <div className="relative p-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  runCommand();
                }}
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-[#303039] bg-[#050506]/95 focus-within:border-[#E84A32]/65 focus-within:shadow-[0_0_28px_-10px_rgba(232,74,50,0.45)] transition-all"
              >
                <Terminal className="w-4 h-4 text-[#E84A32]" />
                <span className="text-[#E84A32] font-mono-code text-sm">&gt;</span>
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="go projetos | abrir emprovium | nova tarefa | buscar..."
                  className="flex-1 bg-transparent text-sm text-[#E6E6EA] placeholder-[#4E4E57] focus:outline-none font-mono-code"
                />
                <kbd className="px-2 py-0.5 rounded border border-[#282830] bg-[#111116] text-[9px] font-mono-code text-[#62626C]">ESC</kbd>
              </form>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {['> command', '> projetos', '> tarefas', '> sessoes', '> historico'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-2 py-1 rounded border border-[#24242C] bg-[#0D0D11] text-[9px] font-mono-code text-[#666670] hover:text-[#FF7A59] hover:border-[#E84A32]/35 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-3 max-h-[54vh] overflow-y-auto pr-1">
                <div className="space-y-3">
                  <div className="rounded-lg border border-[#222229] bg-[#0A0A0D]/80 p-2.5">
                    <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-[#1D1D23]">
                      <span className="text-[9px] font-mono-code tracking-wider text-[#62626B]">QUICK OPS</span>
                      <Command className="w-3 h-3 text-[#E84A32]" />
                    </div>
                    <button
                      onClick={() => {
                        onOpenNewTask();
                        onClose();
                      }}
                      className="w-full px-2 py-2 rounded-md hover:bg-[#141419] text-left flex items-center gap-2 text-[10px] text-[#A6A6AE] hover:text-white transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#E84A32]" /> NOVA TAREFA
                    </button>
                    <button
                      onClick={() => {
                        onOpenNewProject();
                        onClose();
                      }}
                      className="w-full px-2 py-2 rounded-md hover:bg-[#141419] text-left flex items-center gap-2 text-[10px] text-[#A6A6AE] hover:text-white transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#E84A32]" /> NOVO PROJETO
                    </button>
                  </div>

                  <div className="rounded-lg border border-[#222229] bg-[#0A0A0D]/80 p-3 font-mono-code">
                    <div className="text-[9px] text-[#55555E] mb-2">CHANNEL FEEDBACK</div>
                    <div className="text-[10px] text-[#FF7A59] leading-relaxed">{feedback}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[9px] font-mono-code text-[#5E5E68] tracking-wider">
                      <Search className="w-3 h-3 text-[#E84A32]" /> PROJECT NODES
                    </div>
                    <div className="space-y-1">
                      {filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            onSelectProject(project.id);
                            onClose();
                          }}
                          className="group w-full px-3 py-2.5 rounded-lg border border-transparent hover:border-[#E84A32]/25 hover:bg-[#120907] text-left flex items-center gap-3 transition-all"
                        >
                          <span className="w-7 h-7 rounded-md bg-[#160A08] border border-[#E84A32]/35 text-[#E84A32] flex items-center justify-center text-[10px] font-bold font-heading shrink-0">
                            {project.name.charAt(0)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-[#D7D7DC] truncate">{project.name}</span>
                              <span className="text-[9px] font-mono-code text-[#E84A32]">{project.progress}%</span>
                            </div>
                            <div className="text-[9px] font-mono-code text-[#55555E] truncate mt-0.5">{project.identifier} // {project.phase}</div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-[#414149] group-hover:text-[#E84A32]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTasks.length > 0 && (
                    <div className="pt-2 border-t border-[#202026]">
                      <div className="mb-2 text-[9px] font-mono-code text-[#5E5E68] tracking-wider">TASK SIGNALS</div>
                      <div className="space-y-1">
                        {filteredTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => {
                              onSelectProject(task.projectId);
                              onClose();
                            }}
                            className="w-full px-3 py-2 rounded-md text-left hover:bg-[#111116] transition-colors"
                          >
                            <div className="text-[10px] text-[#A7A7AF] truncate">{task.title}</div>
                            <div className="text-[9px] text-[#51515A] font-mono-code mt-0.5">{task.projectName} // {task.status}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
