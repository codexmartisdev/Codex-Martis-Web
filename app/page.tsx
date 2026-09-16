'use client';

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { LoginView } from '@/components/LoginView';
import { CommandView } from '@/components/CommandView';
import { ProjectsView } from '@/components/ProjectsView';
import { ProjectCommandCenter } from '@/components/ProjectCommandCenter';
import { TasksView } from '@/components/TasksView';
import { SessionsView } from '@/components/SessionsView';
import { HistoryView } from '@/components/HistoryView';
import { EnvironmentsView } from '@/components/EnvironmentsView';
import { SettingsView } from '@/components/SettingsView';
import {
  NewProjectModal,
  NewTaskModal,
  NewEnvironmentModal,
  CommandPaletteModal,
} from '@/components/Modals';
import { ImportProjectJsonModal } from '@/components/ImportProjectJsonModal';
import { MarsSphere } from '@/components/MarsSphere';
import { MartianAtmosphere } from '@/components/MartianAtmosphere';
import { ViewTransition } from '@/components/ViewTransition';

function CodexApp() {
  const { isAuthenticated, isAuthLoading, selectedProjectId, setSelectedProjectId } = useStore();
  const [currentTab, setCurrentTab] = useState<string>('command');

  // Modal States
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isImportProjectJsonOpen, setIsImportProjectJsonOpen] = useState<boolean>(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);
  const [isNewEnvOpen, setIsNewEnvOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [modalProjectId, setModalProjectId] = useState<string | undefined>(undefined);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state while Firebase Auth determines operator session
  if (isAuthLoading) {
    return (
      <div className="martian-shell min-h-screen w-full text-[#F2F2F3] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        <MartianAtmosphere />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <MarsSphere size={180} withReticle={true} />
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E84A32] animate-ping" />
              <span className="text-xs font-bold font-heading tracking-[0.25em] text-[#F2F2F3] uppercase mars-text-glow">
                CODEX MARTIS
              </span>
            </div>
            <p className="text-[11px] text-[#808088] font-mono-code">
              Verificando credenciais de comando e sessão do operador...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewTaskForProject = (projectId: string) => {
    setModalProjectId(projectId);
    setIsNewTaskOpen(true);
  };

  const handleOpenNewEnvForProject = (projectId: string) => {
    setModalProjectId(projectId);
    setIsNewEnvOpen(true);
  };

  const viewKey = selectedProjectId ? `project:${selectedProjectId}` : currentTab;

  return (
    <div className="martian-shell flex min-h-screen text-[#F2F2F3] relative overflow-x-hidden">
      <MartianAtmosphere />

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedProjectId(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Operational Navigation Bar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigateTab={(tab) => {
            setSelectedProjectId(null);
            setCurrentTab(tab);
          }}
          onOpenProject={handleOpenProject}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <ViewTransition viewKey={viewKey}>
            {selectedProjectId ? (
              <ProjectCommandCenter
                projectId={selectedProjectId}
                onBack={() => setSelectedProjectId(null)}
                onNavigateTab={(tab) => {
                  setSelectedProjectId(null);
                  setCurrentTab(tab);
                }}
                onOpenNewTaskModalForProject={handleOpenNewTaskForProject}
                onOpenNewEnvModalForProject={handleOpenNewEnvForProject}
              />
            ) : (
              <>
                {currentTab === 'command' && (
                  <CommandView
                    onNavigateTab={setCurrentTab}
                    onOpenProject={handleOpenProject}
                  />
                )}
                {currentTab === 'projetos' && (
                  <ProjectsView
                    onOpenProject={handleOpenProject}
                    onOpenNewProjectModal={() => {
                      setModalProjectId(undefined);
                      setIsNewProjectOpen(true);
                    }}
                    onOpenImportProjectModal={() => {
                      setIsImportProjectJsonOpen(true);
                    }}
                    onNavigateTab={setCurrentTab}
                  />
                )}
                {currentTab === 'tarefas' && (
                  <TasksView
                    onOpenNewTaskModal={() => {
                      setModalProjectId(undefined);
                      setIsNewTaskOpen(true);
                    }}
                    onOpenProject={handleOpenProject}
                    onNavigateTab={setCurrentTab}
                  />
                )}
                {currentTab === 'sessoes' && (
                  <SessionsView onOpenProject={handleOpenProject} />
                )}
                {currentTab === 'historico' && <HistoryView />}
                {currentTab === 'ambientes' && (
                  <EnvironmentsView
                    onOpenNewEnvModal={() => {
                      setModalProjectId(undefined);
                      setIsNewEnvOpen(true);
                    }}
                    onOpenProject={handleOpenProject}
                  />
                )}
                {currentTab === 'configuracoes' && <SettingsView />}
              </>
            )}
          </ViewTransition>
        </main>
      </div>

      {/* Interactive Global Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={(newId) => {
          setSelectedProjectId(newId);
        }}
      />

      <ImportProjectJsonModal
        isOpen={isImportProjectJsonOpen}
        onClose={() => setIsImportProjectJsonOpen(false)}
        onCreated={(newId) => {
          setSelectedProjectId(newId);
        }}
        onOpenProject={handleOpenProject}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setModalProjectId(undefined);
        }}
        defaultProjectId={modalProjectId}
      />

      <NewEnvironmentModal
        isOpen={isNewEnvOpen}
        onClose={() => {
          setIsNewEnvOpen(false);
          setModalProjectId(undefined);
        }}
        defaultProjectId={modalProjectId}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectProject={handleOpenProject}
        onNavigateTab={(tab) => {
          setSelectedProjectId(null);
          setCurrentTab(tab);
        }}
        onOpenNewTask={() => {
          setModalProjectId(undefined);
          setIsNewTaskOpen(true);
        }}
        onOpenNewProject={() => {
          setModalProjectId(undefined);
          setIsNewProjectOpen(true);
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <CodexApp />
    </StoreProvider>
  );
}
