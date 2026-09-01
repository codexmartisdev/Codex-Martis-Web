'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Environment, EnvironmentCategory } from '@/lib/types';
import {
  Server,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Globe,
  Database,
  Mail,
  Cpu,
  Lock,
  Layers,
  Key,
  User,
} from 'lucide-react';

interface EnvironmentsViewProps {
  onOpenNewEnvModal: () => void;
  onOpenProject: (projectId: string) => void;
}

export const EnvironmentsView: React.FC<EnvironmentsViewProps> = ({
  onOpenNewEnvModal,
  onOpenProject,
}) => {
  const { environments, projects } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEnvs = environments.filter((env) => {
    if (selectedCategory !== 'all' && env.category !== selectedCategory) return false;
    if (selectedProject !== 'all' && env.projectId !== selectedProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        env.name.toLowerCase().includes(q) ||
        env.service.toLowerCase().includes(q) ||
        env.projectName.toLowerCase().includes(q) ||
        (env.account && env.account.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryIcon = (category: EnvironmentCategory) => {
    switch (category) {
      case 'Produção':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'Desenvolvimento':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'Banco de Dados':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'Serviço de Terceiros':
        return <Mail className="w-4 h-4 text-purple-400" />;
      default:
        return <Server className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
            AMBIENTES
            <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
          </h1>
          <p className="text-xs text-[#808088] mt-1 font-mono-code">
            Mapeamento central de infraestrutura, bancos de dados e serviços terceiros.
          </p>
        </div>

        <button
          onClick={onOpenNewEnvModal}
          className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(232,74,50,0.3)] transition-all font-heading self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NOVO AMBIENTE</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#0C0C0E] border border-[#232328]">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODAS AS CATEGORIAS</option>
          <option value="Produção">Produção</option>
          <option value="Desenvolvimento">Desenvolvimento</option>
          <option value="Banco de Dados">Banco de Dados</option>
          <option value="Serviço de Terceiros">Serviço de Terceiros</option>
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODOS OS PROJETOS</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#66666D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ambientes..."
            className="w-full bg-[#070709] border border-[#232328] focus:border-[#E84A32] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F2F2F3] placeholder-[#4E4E56] focus:outline-none"
          />
        </div>
      </div>

      {/* Environments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEnvs.map((env) => (
          <div
            key={env.id}
            className="bg-[#0C0C0E] border border-[#232328] hover:border-[#383842] rounded-xl p-5 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#141418] border border-[#282830] flex items-center justify-center">
                    {getCategoryIcon(env.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#F2F2F3] leading-tight">{env.name}</h3>
                    <p
                      onClick={() => onOpenProject(env.projectId)}
                      className="text-[11px] text-[#E84A32] hover:underline cursor-pointer"
                    >
                      {env.projectName}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-[#181820] text-zinc-300 border border-[#282832] text-[10px] font-bold font-heading">
                  {env.status}
                </span>
              </div>

              {/* Service & Provider */}
              <div className="p-2.5 rounded-lg bg-[#101014] border border-[#1A1A20] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#808088]">Provedor / Serviço:</span>
                  <span className="font-semibold text-[#D8D8DC]">{env.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#808088]">Conta Vinculada:</span>
                  <span className="font-mono-code text-[#A0A0A7] truncate max-w-[180px]">
                    {env.account}
                  </span>
                </div>
                {env.accessMethod && (
                  <div className="flex justify-between">
                    <span className="text-[#808088]">Acesso:</span>
                    <span className="text-[#D8D8DC]">{env.accessMethod}</span>
                  </div>
                )}
              </div>

              {/* URL */}
              {env.url && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#808088] font-mono-code truncate max-w-[220px]">
                    {env.url}
                  </span>
                  <a
                    href={env.url.startsWith('http') ? env.url : `https://${env.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E84A32] hover:text-[#FF6B4A] p-1"
                    title="Acessar ambiente"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Test user */}
              {env.testUser && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#A0A0A7] bg-[#141418] px-2.5 py-1.5 rounded font-mono-code">
                  <User className="w-3 h-3 text-[#66666D]" />
                  <span>Usuário teste: {env.testUser}</span>
                </div>
              )}
            </div>

            {/* Observations */}
            {env.observations && (
              <p className="text-[10px] text-[#66666D] pt-2 border-t border-[#1A1A22] leading-relaxed">
                {env.observations}
              </p>
            )}
          </div>
        ))}

        {filteredEnvs.length === 0 && (
          <div className="col-span-full bg-[#0C0C0E] border border-[#232328] rounded-xl p-12 text-center space-y-4 hud-card-corners">
            <p className="text-sm font-semibold text-[#808088]">Nenhum ambiente encontrado.</p>
            <button
              onClick={onOpenNewEnvModal}
              className="px-4 py-2 rounded-lg bg-[#E84A32] hover:bg-[#F06447] text-white text-xs font-bold font-heading uppercase tracking-wider"
            >
              + Cadastrar Ambiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
