'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { HistoryCategory } from '@/lib/types';
import {
  History,
  Rocket,
  Shield,
  Wrench,
  PlayCircle,
  Settings,
  FolderKanban,
  GitCommit,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, projects } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedProject !== 'all' && item.projectId !== selectedProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        (item.projectName && item.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryIcon = (category: HistoryCategory) => {
    switch (category) {
      case 'deploy':
        return <Rocket className="w-4 h-4 text-emerald-400" />;
      case 'auditoria':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'correcao':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'sessao':
        return <PlayCircle className="w-4 h-4 text-[#E84A32]" />;
      case 'configuracao':
        return <Settings className="w-4 h-4 text-blue-400" />;
      case 'projeto':
        return <FolderKanban className="w-4 h-4 text-zinc-300" />;
      default:
        return <History className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[0.2em] font-heading text-[#F2F2F3] uppercase flex items-center gap-2">
          HISTÓRICO
          <span className="inline-block w-8 h-[2px] bg-[#E84A32]" />
        </h1>
        <p className="text-xs text-[#808088] mt-1 font-mono-code">
          Registro cronológico imutável de eventos, deploys, decisões e missões.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#0C0C0E] border border-[#232328]">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#070709] border border-[#232328] rounded-lg px-3 py-1.5 text-xs text-[#D8D8DC] focus:outline-none focus:border-[#E84A32]"
        >
          <option value="all">TODAS AS CATEGORIAS</option>
          <option value="deploy">Deploys & Releases</option>
          <option value="auditoria">Auditorias</option>
          <option value="correcao">Correções & Fixes</option>
          <option value="sessao">Sessões Operacionais</option>
          <option value="projeto">Mudanças em Projetos</option>
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
            placeholder="Filtrar eventos..."
            className="w-full bg-[#070709] border border-[#232328] focus:border-[#E84A32] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F2F2F3] placeholder-[#4E4E56] focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="bg-[#0C0C0E] border border-[#232328] rounded-xl p-6 space-y-4">
        <div className="relative border-l border-[#1F1F26] ml-4 pl-6 space-y-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Dot with Category Icon */}
              <div className="absolute -left-[38px] top-0 w-8 h-8 rounded-full bg-[#0E0E12] border border-[#2A2A35] flex items-center justify-center shadow-lg group-hover:border-[#E84A32] transition-colors">
                {getCategoryIcon(item.category)}
              </div>

              {/* Content Box */}
              <div className="bg-[#0E0E12] border border-[#1C1C22] group-hover:border-[#2C2C38] rounded-xl p-4 transition-colors space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F2F2F3]">{item.title}</span>
                    {item.projectName && (
                      <span className="px-2 py-0.5 rounded bg-[#181820] text-[#E84A32] font-semibold text-[10px] font-heading">
                        {item.projectName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#66666D] font-mono-code flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                </div>

                {item.details && (
                  <p className="text-[#A0A0A7] text-xs leading-relaxed">{item.details}</p>
                )}

                {item.commitHash && (
                  <div className="pt-2 border-t border-[#181820] flex items-center gap-2 text-[10px]">
                    <span className="font-mono-code bg-[#141418] px-2 py-0.5 rounded text-[#A0A0A7] flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-[#E84A32]" />
                      {item.commitHash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
