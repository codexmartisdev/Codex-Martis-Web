'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  ProjectStatus,
  EnvironmentCategory,
} from '@/lib/types';
import {
  X,
  Plus,
  Target,
  FolderKanban,
  CheckSquare,
  Server,
  Search,
  Sparkles,
  Command,
  ArrowRight,
  PlayCircle,
  History,
  Layers,
} from 'lucide-react';

// ==========================================
// 1. NEW PROJECT MODAL
// ==========================================
interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addProject } = useStore();

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState('Projeto Web');
  const [phase, setPhase] = useState('Beta Solo');
  const [status, setStatus] = useState<ProjectStatus>('desenvolvimento');
  const [objective, setObjective] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Alta');
  const [nextTaskTitle, setNextTaskTitle] = useState('');
  const [nextTaskWhyImportant, setNextTaskWhyImportant] = useState('');
  const [recommendedTool, setRecommendedTool] = useState('Google AI Studio');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const autoId = identifier.trim()
      ? identifier.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    addProject({
      id: autoId,
      name,
      identifier: identifier || autoId.toUpperCase(),
      type,
      phase,
      status,
      health: 'saudavel',
      progress: 0,
      objective: objective || 'Desenvolver a primeira versão do sistema.',
      priority,
      nextTaskTitle: nextTaskTitle || 'Planejamento inicial e setup de arquitetura',
      nextTaskWhyImportant: nextTaskWhyImportant || 'Estruturar a base da aplicação para desenvolvimento contínuo.',
      recommendedTool,
      statePhoto: {
        working: ['Setup inicial'],
        partiallyWorking: [],
        notWorking: [],
        untested: [],
        outOfScope: [],
      },
    });

    onCreated(autoId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-2xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C22]">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#E84A32]" />
            <h2 className="text-base font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              CRIAR NOVO PROJETO NO CODEX
            </h2>
          </div>
          <button onClick={onClose} className="text-[#66666D] hover:text-[#F2F2F3] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Nome do Projeto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!identifier) {
                    setIdentifier(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                placeholder="Ex: AdvoDesk"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Identificador / Código
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: advodesk"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs font-mono-code text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Tipo
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Ex: Projeto Web, Site Institucional, Automação"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Fase Atual
              </label>
              <input
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="Ex: Beta Solo, MVP, Produção"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
              Objetivo da Fase Atual
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Disponibilizar uma versão Beta funcional para usuários e coletar feedback..."
              className="w-full bg-[#070709] border border-[#232328] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Próxima Missão Principal
              </label>
              <input
                type="text"
                value={nextTaskTitle}
                onChange={(e) => setNextTaskTitle(e.target.value)}
                placeholder="Ex: Corrigir persistência real dos processos no Firestore"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Ferramenta Recomendada
              </label>
              <input
                type="text"
                value={recommendedTool}
                onChange={(e) => setRecommendedTool(e.target.value)}
                placeholder="Ex: Google AI Studio, Google Cloud Shell"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
              Por que esta missão é importante?
            </label>
            <textarea
              rows={2}
              value={nextTaskWhyImportant}
              onChange={(e) => setNextTaskWhyImportant(e.target.value)}
              placeholder="Ex: Garantir consistência e confiabilidade dos dados para a continuidade da missão..."
              className="w-full bg-[#070709] border border-[#232328] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C22]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs font-heading uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Projeto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. NEW TASK MODAL
// ==========================================
interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const { projects, addTask, setTaskAsNextMission } = useStore();

  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Melhoria');
  const [priority, setPriority] = useState<TaskPriority>('Alta');
  const [status, setStatus] = useState<TaskStatus>('Pendente');
  const [assignedTo, setAssignedTo] = useState('Marco Aquino');
  const [isNextMission, setIsNextMission] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    const newTaskId = `task-${Date.now()}`;
    const selectedProject = projects.find((p) => p.id === projectId);

    addTask({
      id: newTaskId,
      projectId,
      projectName: selectedProject?.name || 'Projeto',
      title,
      description,
      type,
      priority,
      status,
      assignedTo,
      isNextMission,
    });

    if (isNextMission) {
      setTaskAsNextMission(projectId, newTaskId);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C22]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#E84A32]" />
            <h2 className="text-base font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              NOVA TAREFA
            </h2>
          </div>
          <button onClick={onClose} className="text-[#66666D] hover:text-[#F2F2F3] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
              Projeto Vinculado *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
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
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implementar exportação de relatórios em PDF"
              className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
              Descrição Detalhada
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes de aceitação, contexto ou instruções..."
              className="w-full bg-[#070709] border border-[#232328] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                <option value="Bug">Bug</option>
                <option value="Auditoria">Auditoria</option>
                <option value="Melhoria">Melhoria</option>
                <option value="Feature">Feature</option>
                <option value="Infraestrutura">Infraestrutura</option>
                <option value="Teste">Teste</option>
                <option value="Documentação">Documentação</option>
                <option value="Ideia">Ideia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#D8D8DC]">
              <input
                type="checkbox"
                checked={isNextMission}
                onChange={(e) => setIsNextMission(e.target.checked)}
                className="rounded bg-[#070709] border-[#2E2E35] text-[#E84A32] focus:ring-[#E84A32] accent-[#E84A32] w-4 h-4"
              />
              <span className="font-semibold font-heading text-[#E84A32]">
                Definir imediatamente como Próxima Missão Principal do Projeto
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C22]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs font-heading uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Tarefa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. NEW ENVIRONMENT MODAL
// ==========================================
interface NewEnvModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const NewEnvironmentModal: React.FC<NewEnvModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const { projects, addEnvironment } = useStore();

  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EnvironmentCategory>('Produção');
  const [service, setService] = useState('Firebase');
  const [account, setAccount] = useState('marcoa.aquino@gmail.com');
  const [url, setUrl] = useState('');
  const [accessMethod, setAccessMethod] = useState('Console / CLI');
  const [testUser, setTestUser] = useState('');
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    const selectedProject = projects.find((p) => p.id === projectId);

    addEnvironment({
      id: `env-${Date.now()}`,
      projectId,
      projectName: selectedProject?.name || 'Projeto',
      name,
      category,
      service,
      account,
      url,
      status: 'Configurado',
      accessMethod,
      testUser,
      observations,
      badgeCode: service.slice(0, 3).toUpperCase(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0C0C0E] border border-[#282830] rounded-xl max-w-xl w-full p-6 relative shadow-2xl hud-card-corners animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C22]">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#E84A32]" />
            <h2 className="text-base font-bold font-heading text-[#F2F2F3] uppercase tracking-wider">
              NOVO AMBIENTE OU SERVIÇO
            </h2>
          </div>
          <button onClick={onClose} className="text-[#66666D] hover:text-[#F2F2F3] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Projeto *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Nome do Ambiente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Firebase Produção"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              >
                <option value="Produção">Produção</option>
                <option value="Desenvolvimento">Desenvolvimento</option>
                <option value="Homologação">Homologação</option>
                <option value="Banco de Dados">Banco de Dados</option>
                <option value="Serviço de Terceiros">Serviço de Terceiros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Provedor / Serviço
              </label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Ex: Firebase, Vercel, Supabase, Resend"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                Conta Vinculada
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="email@dominio.com"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
                URL / Host / Endpoint
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://app.advodesk.com.br"
                className="w-full bg-[#070709] border border-[#232328] rounded-lg px-3 py-2 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C5C5CB] mb-1 font-heading">
              Observações / Instruções de Acesso
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Instruções de login, variáveis de ambiente ou notas..."
              className="w-full bg-[#070709] border border-[#232328] rounded-lg p-2.5 text-xs text-[#F2F2F3] focus:border-[#E84A32] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C22]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141418] hover:bg-[#1E1E26] text-[#A0A0A7] text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs font-heading uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.5)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Ambiente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. COMMAND PALETTE MODAL (Ctrl+K)
// ==========================================
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNavigateTab,
  onOpenNewTask,
  onOpenNewProject,
}) => {
  const { projects, tasks, environments, startSession } = useStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4">
      <div className="bg-[#0C0C0E] border border-[#2E2E38] rounded-xl max-w-xl w-full p-4 relative shadow-2xl hud-card-corners animate-in zoom-in-95">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-[#232328]">
          <Search className="w-4 h-4 text-[#E84A32]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando, projeto ou tarefa..."
            className="w-full bg-transparent text-sm text-[#F2F2F3] placeholder-[#66666D] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#181820] text-[#808088] text-[10px] font-mono-code border border-[#282830]">
            ESC
          </kbd>
        </div>

        {/* Action Results */}
        <div className="py-2 space-y-4 max-h-80 overflow-y-auto text-xs mt-2">
          {/* Quick Actions */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-[#808088] uppercase tracking-wider font-heading">
              Ações Rápidas
            </p>
            <button
              onClick={() => {
                onOpenNewTask();
                onClose();
              }}
              className="w-full px-3 py-2 rounded-lg hover:bg-[#14141A] text-left flex items-center justify-between text-[#D8D8DC] hover:text-[#E84A32] group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#E84A32]" />
                <span>Nova Tarefa</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => {
                onOpenNewProject();
                onClose();
              }}
              className="w-full px-3 py-2 rounded-lg hover:bg-[#14141A] text-left flex items-center justify-between text-[#D8D8DC] hover:text-[#E84A32] group"
            >
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#E84A32]" />
                <span>Cadastrar Novo Projeto</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-[#808088] uppercase tracking-wider font-heading">
              Navegação
            </p>
            {[
              { id: 'command', label: 'Command Cockpit' },
              { id: 'projetos', label: 'Lista de Projetos' },
              { id: 'tarefas', label: 'Todas as Tarefas' },
              { id: 'sessoes', label: 'Sessões & Execução' },
              { id: 'historico', label: 'Histórico Operacional' },
              { id: 'ambientes', label: 'Ambientes & Infraestrutura' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  onNavigateTab(nav.id);
                  onClose();
                }}
                className="w-full px-3 py-1.5 rounded-lg hover:bg-[#14141A] text-left flex items-center justify-between text-[#A0A0A7] hover:text-white"
              >
                <span>{nav.label}</span>
                <span className="text-[10px] font-mono-code text-[#55555D]">Ir para</span>
              </button>
            ))}
          </div>

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-[#808088] uppercase tracking-wider font-heading">
                Projetos
              </p>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-[#14141A] text-left flex items-center justify-between text-[#F2F2F3]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#180A08] border border-[#E84A32]/40 text-[#E84A32] flex items-center justify-center text-[10px] font-bold">
                      {p.name.charAt(0)}
                    </span>
                    <span>{p.name}</span>
                    <span className="text-[10px] text-[#66666D]">({p.phase})</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E84A32]">{p.progress}%</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
