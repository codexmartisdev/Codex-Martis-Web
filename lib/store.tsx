'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  Task,
  Session,
  HistoryEvent,
  Environment,
  ProjectUpdate,
  PromptTemplate,
  UserProfile,
  TaskStatus,
  ProjectHealth,
  ProjectStatus,
  SessionResult,
} from './types';
import {
  signInWithGoogle,
  logoutUser,
  subscribeToAuthState,
  getOperatorFallbackProfile,
  AUTHORIZED_OPERATOR_EMAIL,
} from './firebase/auth';
import {
  DEFAULT_PROJECT_UPDATE_PROMPT,
  DEFAULT_PROJECT_IMPORT_PROMPT,
} from './constants/prompts';
import {
  validateProjectImportJson,
  buildEntitiesFromProjectImport,
  ValidationResult,
} from './projectImport';
import {
  validateProjectUpdateJson,
  applyProjectUpdatePatch,
  generateCompleteUpdatePrompt,
  UpdateValidationResult,
  ProjectUpdateDiff,
} from './projectUpdate';
import { ProjectImportSchema1 } from './types';

// Default prompt template for Codex Martis v1.0
const DEFAULT_GLOBAL_PROMPT_TEMPLATE = DEFAULT_PROJECT_UPDATE_PROMPT;

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'advodesk',
    name: 'AdvoDesk',
    identifier: 'advodesk',
    description: 'Sistema de Gestão Jurídica para advogados solo e pequenos escritórios.',
    type: 'Projeto Web',
    status: 'desenvolvimento',
    phase: 'Beta Solo',
    health: 'atencao',
    progress: 72,
    objective: 'Disponibilizar uma versão Beta funcional para um advogado solo utilizar e fornecer feedback prático.',
    nextTaskId: 'task-1',
    nextTaskTitle: 'Corrigir persistência real dos processos no Firestore',
    nextTaskWhyImportant: 'Garantir consistência e confiabilidade dos dados dos processos para a continuidade da missão.',
    recommendedTool: 'Google Cloud Shell',
    priority: 'alta',
    mainAccount: 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: ['Autenticação Firebase Auth', 'Navegação e Layout Base', 'Listagem de Clientes'],
      partiallyWorking: ['Cadastro e Edição de Processos (Firestore)', 'Validações de formulários'],
      notWorking: ['Fluxo de recuperação de senha'],
      untested: ['Relatórios analíticos', 'Exportação de petições'],
      outOfScope: ['Google Drive sincronização na v1 (removido para reduzir complexidade)'],
    },
    lastCommit: 'd92ac73',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-01T08:45:00Z',
  },
  {
    id: 'emprovium',
    name: 'Emprovium',
    identifier: 'emprovium',
    description: 'Plataforma de automação comercial e gestão de fornecedores.',
    type: 'Projeto Web',
    status: 'desenvolvimento',
    phase: 'Desenvolvimento',
    health: 'saudavel',
    progress: 48,
    objective: 'Implementar dashboard administrativo v2 e fluxo de cotações automáticas.',
    nextTaskId: 'task-7',
    nextTaskTitle: 'Otimizar carregamento do dashboard',
    nextTaskWhyImportant: 'Dashboard está com latência excessiva em conexões móveis.',
    recommendedTool: 'Google AI Studio',
    priority: 'media',
    mainAccount: 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: ['Módulo de cotação', 'Integração de pedidos'],
      partiallyWorking: ['Dashboard analítico v2'],
      notWorking: [],
      untested: ['Notificações WhatsApp'],
      outOfScope: ['Gateway de pagamento próprio'],
    },
    lastCommit: 'a81bc22',
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-09-01T07:45:00Z',
  },
  {
    id: 'site-eng-civil',
    name: 'Site Eng. Civil',
    identifier: 'site-eng-civil',
    description: 'Site institucional de alta conversão e portfólio de engenharia estrutural.',
    type: 'Site Institucional',
    status: 'producao',
    phase: 'Produção',
    health: 'saudavel',
    progress: 91,
    objective: 'Otimizar performance de imagens e SEO técnico para captação orgânica.',
    nextTaskId: null,
    nextTaskTitle: 'Otimizar performance de imagens e SEO técnico',
    nextTaskWhyImportant: 'Melhorar score Core Web Vitals no Google Search.',
    recommendedTool: 'VS Code',
    priority: 'baixa',
    mainAccount: 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: ['Home page', 'Formulário de contato', 'Portfólio de obras', 'Deploy Vercel'],
      partiallyWorking: [],
      notWorking: [],
      untested: [],
      outOfScope: [],
    },
    lastCommit: 'c44e901',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-09-01T06:30:00Z',
  },
  {
    id: 'site-advogado',
    name: 'Site Advogado',
    identifier: 'site-advogado',
    description: 'Site institucional moderno para escritório de advocacia criminal e civil.',
    type: 'Site Institucional',
    status: 'desenvolvimento',
    phase: 'Desenvolvimento',
    health: 'saudavel',
    progress: 35,
    objective: 'Desenvolver página de áreas de atuação e formulário de agendamento integrado.',
    nextTaskId: 'task-5',
    nextTaskTitle: 'Implementar fluxo de recuperação de senha',
    nextTaskWhyImportant: 'Permitir que clientes acessem a área restrita com segurança.',
    recommendedTool: 'Google AI Studio',
    priority: 'media',
    mainAccount: 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: ['Layout responsivo', 'Hero section', 'Apresentação institucional'],
      partiallyWorking: ['Áreas de atuação'],
      notWorking: [],
      untested: [],
      outOfScope: [],
    },
    lastCommit: 'f1209cc',
    createdAt: '2026-08-20T11:00:00Z',
    updatedAt: '2026-08-31T20:00:00Z',
  },
  {
    id: 'automacao-ppci',
    name: 'Automação PPCI',
    identifier: 'automacao-ppci',
    description: 'Sistema interno de cálculo e geração automática de laudos de combate a incêndio.',
    type: 'Sistema Interno',
    status: 'planejamento',
    phase: 'Planejamento',
    health: 'saudavel',
    progress: 12,
    objective: 'Definir arquitetura de dados e fluxos de cálculo segundo as normas técnicas.',
    nextTaskId: 'task-6',
    nextTaskTitle: 'Definir arquitetura do sistema PPCI',
    nextTaskWhyImportant: 'Documento de arquitetura essencial antes de iniciar a codificação.',
    recommendedTool: 'Documentação / Miro',
    priority: 'alta',
    mainAccount: 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: ['Levantamento de requisitos'],
      partiallyWorking: [],
      notWorking: [],
      untested: [],
      outOfScope: [],
    },
    lastCommit: 'init-001',
    createdAt: '2026-08-25T16:00:00Z',
    updatedAt: '2026-08-28T11:40:00Z',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'Corrigir persistência do cadastro de processos no Firestore',
    description: 'Dados não estão sendo salvos corretamente em alguns casos ao recarregar a tela.',
    type: 'Bug',
    priority: 'Crítica',
    status: 'Em andamento',
    assignedTo: 'Marco',
    isNextMission: true,
    createdAt: '2026-08-31T20:00:00Z',
    updatedAt: '2026-08-31T23:45:00Z',
  },
  {
    id: 'task-2',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'Remover dados fictícios do fluxo de documentos',
    description: 'A auditoria identificou dados simulados ainda presentes no formulário de minutas.',
    type: 'Auditoria',
    priority: 'Alta',
    status: 'Pendente',
    assignedTo: 'Marco',
    isNextMission: false,
    createdAt: '2026-08-31T20:00:00Z',
    updatedAt: '2026-08-31T21:17:00Z',
  },
  {
    id: 'task-3',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'Melhorar validações dos formulários',
    description: 'Adicionar validações mais robustas nos campos críticos de prazos processuais e OAB.',
    type: 'Melhoria',
    priority: 'Média',
    status: 'Pendente',
    assignedTo: 'Marco',
    isNextMission: false,
    createdAt: '2026-08-30T18:00:00Z',
    updatedAt: '2026-08-30T19:30:00Z',
  },
  {
    id: 'task-4',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'Ajustar regras de segurança do Firestore',
    description: 'Regras atuais estão permitindo acessos indevidos em coleções de auditoria.',
    type: 'Bug',
    priority: 'Alta',
    status: 'Em andamento',
    assignedTo: 'Marco',
    isNextMission: false,
    createdAt: '2026-08-30T15:00:00Z',
    updatedAt: '2026-08-30T16:05:00Z',
  },
  {
    id: 'task-5',
    projectId: 'site-advogado',
    projectName: 'Site Advogado',
    title: 'Implementar fluxo de recuperação de senha',
    description: 'Página de recuperação ainda não implementada no painel do cliente.',
    type: 'Feature',
    priority: 'Média',
    status: 'Pendente',
    assignedTo: 'Marco',
    isNextMission: true,
    createdAt: '2026-08-29T13:00:00Z',
    updatedAt: '2026-08-29T14:22:00Z',
  },
  {
    id: 'task-6',
    projectId: 'automacao-ppci',
    projectName: 'Automação PPCI',
    title: 'Definir arquitetura do sistema PPCI',
    description: 'Documento de arquitetura e tecnologias necessárias para os cálculos de hidrantes.',
    type: 'Infraestrutura',
    priority: 'Alta',
    status: 'Pendente',
    assignedTo: 'Marco',
    isNextMission: true,
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-28T11:40:00Z',
  },
  {
    id: 'task-7',
    projectId: 'emprovium',
    projectName: 'Emprovium',
    title: 'Otimizar carregamento do dashboard',
    description: 'Dashboard está lento em conexões móveis por falta de paginação.',
    type: 'Melhoria',
    priority: 'Baixa',
    status: 'Pendente',
    assignedTo: 'Marco',
    isNextMission: true,
    createdAt: '2026-08-27T08:00:00Z',
    updatedAt: '2026-08-27T09:15:00Z',
  },
  {
    id: 'task-8',
    projectId: 'emprovium',
    projectName: 'Emprovium',
    title: 'Configurar domínio personalizado na Vercel',
    description: 'Aguardar liberação do domínio e configurar DNS no Cloudflare.',
    type: 'Infraestrutura',
    priority: 'Baixa',
    status: 'Concluída',
    assignedTo: 'Marco',
    isNextMission: false,
    createdAt: '2026-08-26T16:00:00Z',
    updatedAt: '2026-08-26T17:50:00Z',
  },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'session-24',
    sessionNumber: 24,
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    taskId: 'task-1',
    taskTitle: 'Corrigir persistência do cadastro de processos no Firestore',
    objective: 'Corrigir persistência do cadastro de processos no Firestore e validar gravação após recarregar a página.',
    startedAt: '2026-09-01T00:32:00Z',
    endedAt: '2026-09-01T02:58:00Z',
    durationSeconds: 8760,
    status: 'encerrada',
    workDone: 'Corrigida função de escrita assíncrona no Firestore e adicionada confirmação de ID gerado.',
    result: 'Sucesso',
    testsDone: 'Testado cadastro com 5 processos e recarregamento sem perdas.',
    commitHash: 'd92ac73',
    commitMessage: 'Corrige persistência do cadastro de processos e ajusta regras de segurança do Firestore.',
    deployDone: true,
    problemsFound: 'Regras de segurança precisavam de liberação para subcoleções.',
    decisionsTaken: 'Isolar subcoleções de eventos processuais.',
    newNextMission: 'Remover dados fictícios do fluxo de documentos.',
  },
  {
    id: 'session-23',
    sessionNumber: 23,
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    taskId: 'task-2',
    taskTitle: 'Remover dados fictícios do fluxo de documentos',
    objective: 'Remover dados fictícios do fluxo de documentos e corrigir persistência do Firestore.',
    startedAt: '2026-08-31T18:44:00Z',
    endedAt: '2026-08-31T19:50:00Z',
    durationSeconds: 3960,
    status: 'encerrada',
    workDone: 'Removidos dados simulados e ajustadas regras de segurança.',
    result: 'Sucesso',
    commitHash: 'c22fa10',
    commitMessage: 'Remove dados simulados do fluxo de partes e advogados.',
    deployDone: false,
    newNextMission: 'Corrigir persistência real dos processos no Firestore.',
  },
];

const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-1',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Produção',
    badgeCode: 'PRD',
    category: 'Vercel',
    service: 'Aplicação Web',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Produção',
    identifier: 'advodesk-prod',
    url: 'https://advodesk.com.br',
    domain: 'advodesk.com.br',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'Vercel',
    currentVersion: 'v1.2.4',
    lastDeploy: '01/09/2026 08:45',
    sslStatus: 'Válido',
    status: 'Ativo',
    observations: 'Domínio principal em produção com SSL automático.',
    updatedAt: '2026-09-01T08:45:00Z',
  },
  {
    id: 'env-2',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Banco de Dados',
    badgeCode: 'DB',
    category: 'Banco',
    service: 'PostgreSQL',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Produção',
    identifier: 'advodesk-db-prod',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'Neon / Cloud SQL',
    currentVersion: 'PostgreSQL 16',
    lastDeploy: '01/09/2026 08:32',
    sslStatus: 'Exigido',
    status: 'Ativo',
    observations: 'Pool de conexões configurado com limite de 20 conexões.',
    updatedAt: '2026-09-01T08:32:00Z',
  },
  {
    id: 'env-3',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Storage & Backups',
    badgeCode: 'STG',
    category: 'Object Storage',
    service: 'Object Storage',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Produção',
    identifier: 'advodesk-storage',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'Google Cloud Storage',
    status: 'Ativo',
    observations: 'Bucket para guarda de petições e anexos jurídicos.',
    updatedAt: '2026-09-01T07:55:00Z',
  },
  {
    id: 'env-4',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Homologação',
    badgeCode: 'HML',
    category: 'Vercel',
    service: 'Aplicação Web',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Homologação',
    identifier: 'advodesk-staging',
    url: 'https://hml.advodesk.com.br',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'Vercel',
    currentVersion: 'v1.2.5-rc1',
    lastDeploy: '31/08/2026 22:11',
    status: 'Atenção',
    observations: 'Aviso de uso de CPU acima da média detectado.',
    updatedAt: '2026-08-31T22:11:00Z',
  },
  {
    id: 'env-5',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Desenvolvimento',
    badgeCode: 'DEV',
    category: 'Cloud Shell',
    service: 'Aplicação Web',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Desenvolvimento',
    identifier: 'dev.advodesk.local',
    url: 'http://localhost:3000',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'Local / Cloud Shell',
    currentVersion: 'v1.2.5-dev',
    status: 'Ativo',
    observations: 'Ambiente local para desenvolvimento e testes unitários.',
    updatedAt: '2026-08-31T19:40:00Z',
  },
  {
    id: 'env-6',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Serviço de E-mail',
    badgeCode: 'MAIL',
    category: 'Resend',
    service: 'E-mail API',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Produção',
    identifier: 'resend.com',
    region: 'Global 🌐',
    provider: 'Resend',
    status: 'Ativo',
    observations: 'Domínio verificado com DKIM e SPF ativos.',
    updatedAt: '2026-08-31T18:05:00Z',
  },
  {
    id: 'env-7',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Autenticação',
    badgeCode: 'AUTH',
    category: 'Firebase',
    service: 'Auth Service',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Produção',
    identifier: 'advodesk-auth',
    region: 'Global 🌐',
    provider: 'Firebase Auth',
    status: 'Ativo',
    observations: 'Provedores ativos: E-mail/Senha e Google OAuth.',
    updatedAt: '2026-08-31T17:50:00Z',
  },
  {
    id: 'env-8',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    name: 'Ambiente Antigo',
    badgeCode: 'OLD',
    category: 'Outro',
    service: 'Aplicação Web',
    account: 'codex.martis.dev@gmail.com',
    environmentType: 'Outro',
    identifier: 'old.advodesk.com.br',
    region: 'São Paulo (sa-east-1) 🇧🇷',
    provider: 'VPS Antiga',
    status: 'Inativo',
    observations: 'Desativado após migração para Vercel.',
    updatedAt: '2026-08-20T10:12:00Z',
  },
];

const INITIAL_HISTORY: HistoryEvent[] = [
  {
    id: 'hist-1',
    type: 'SESSION_FINISHED',
    category: 'SESSAO',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'SESSÃO ENCERRADA #024',
    description: 'Corrigida persistência do cadastro de processos no Firestore e validada a gravação após recarregar a página.',
    user: 'Marco Aquino',
    timestamp: '01/09/2026 02:58',
    commitHash: 'd92ac73',
  },
  {
    id: 'hist-2',
    type: 'COMMIT_RECORDED',
    category: 'COMMIT',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'COMMIT d92ac73',
    description: 'Corrige persistência do cadastro de processos e ajusta regras de segurança do Firestore.',
    user: 'Marco Aquino',
    timestamp: '01/09/2026 02:42',
    commitHash: 'd92ac73',
  },
  {
    id: 'hist-3',
    type: 'DEPLOY_RECORDED',
    category: 'DEPLOY',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'DEPLOY Vercel',
    description: 'Deploy da versão com correção da persistência em produção.',
    user: 'Marco Aquino',
    timestamp: '01/09/2026 02:45',
  },
  {
    id: 'hist-4',
    type: 'DECISION_RECORDED',
    category: 'DECISAO',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'DECISÃO',
    description: 'Google Drive removido do escopo da versão Beta Solo para reduzir complexidade e garantir entrega rápida.',
    user: 'Marco Aquino',
    timestamp: '31/08/2026 21:30',
  },
  {
    id: 'hist-5',
    type: 'AUDIT_RECORDED',
    category: 'AUDITORIA',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'AUDITORIA Beta Solo',
    description: 'Auditoria identificou dados fictícios no cadastro e falhas de persistência em alguns fluxos.',
    user: 'Marco Aquino',
    timestamp: '31/08/2026 20:05',
  },
  {
    id: 'hist-6',
    type: 'TASK_COMPLETED',
    category: 'TAREFA',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'TAREFA CONCLUÍDA',
    description: 'Ajustar regras de segurança do Firestore para permitir gravação dos dados.',
    user: 'Marco Aquino',
    timestamp: '31/08/2026 19:50',
  },
  {
    id: 'hist-7',
    type: 'SESSION_STARTED',
    category: 'SESSAO',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'SESSÃO INICIADA #023',
    description: 'Remover dados fictícios do fluxo de documentos e corrigir persistência do Firestore.',
    user: 'Marco Aquino',
    timestamp: '31/08/2026 18:44',
  },
  {
    id: 'hist-8',
    type: 'TASK_COMPLETED',
    category: 'TAREFA',
    projectId: 'advodesk',
    projectName: 'AdvoDesk',
    title: 'TAREFA CONCLUÍDA',
    description: 'Remover dados fictícios do cadastro de partes e advogados.',
    user: 'Marco Aquino',
    timestamp: '31/08/2026 17:20',
  },
];

interface StoreContextType {
  // State
  projects: Project[];
  tasks: Task[];
  sessions: Session[];
  activeSession: Session | null;
  environments: Environment[];
  history: HistoryEvent[];
  projectUpdates: ProjectUpdate[];
  promptTemplates: PromptTemplate[];
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  selectedProjectId: string | null;

  // Navigation & Project Command Center selection
  setSelectedProjectId: (id: string | null) => void;

  // Next Mission derivation helper
  getProjectNextTask: (projectId: string) => Task | null;
  getProjectNextMissionTitle: (project: Project) => string;

  // Project Actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  addProject: (project: Partial<Project> & { name: string }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  addTask: (task: any) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskAsNextMission: (projectId: string, taskId: string) => void;

  // Session Actions
  startSession: (projectId: string, taskId?: string, customObjective?: string) => Session | null;
  finishSession: (arg1: any, arg2?: any) => void;
  cancelActiveSession: () => void;

  // Environment Actions
  createEnvironment: (env: Omit<Environment, 'id' | 'updatedAt'>) => Environment;
  addEnvironment: (env: any) => Environment;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;

  // History Actions
  addHistoryEvent: (event: Omit<HistoryEvent, 'id' | 'timestamp' | 'user'>) => void;

  // Prompt Generator
  getProjectPrompt: (projectId: string, includeContext: boolean) => string;
  updateGlobalPromptTemplate: (content: string) => void;

  // JSON Patch Importer
  importProjectUpdateJson: (projectId: string, jsonString: string) => UpdateValidationResult;
  applyParsedUpdate: (projectId: string, diff: ProjectUpdateDiff, rawJsonString?: string) => void;

  // Project Creation via JSON Import
  validateProjectImport: (jsonString: string) => ValidationResult;
  createProjectFromImport: (data: ProjectImportSchema1, rawJsonString?: string) => { success: boolean; projectId?: string; error?: string };

  // Real Firebase Auth
  signInWithGoogleAuth: () => Promise<{ success: boolean; error?: string; isUnauthorizedDomain?: boolean }>;
  loginAsAuthorizedOperator: () => void;
  login: (email?: string, pass?: string, isGoogle?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  // Backup & Reset
  exportDatabaseJson: () => string;
  loadDemoData: () => void;
  resetToInitialSeed: () => void;
  resetAllDataToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_projects');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading projects from localStorage', e);
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_tasks');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading tasks from localStorage', e);
      }
    }
    return [];
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_sessions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading sessions from localStorage', e);
      }
    }
    return [];
  });

  const [activeSession, setActiveSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_active_session');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading activeSession from localStorage', e);
      }
    }
    return null;
  });

  const [environments, setEnvironments] = useState<Environment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_environments');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading environments from localStorage', e);
      }
    }
    return [];
  });

  const [history, setHistory] = useState<HistoryEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading history from localStorage', e);
      }
    }
    return [];
  });

  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_project_updates');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading projectUpdates from localStorage', e);
      }
    }
    return [];
  });

  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(() => {
    const defaultList: PromptTemplate[] = [
      {
        id: 'template-project-update',
        name: 'Atualização de Projeto',
        schema_version: '1.0',
        content: DEFAULT_PROJECT_UPDATE_PROMPT,
        isDefault: true,
      },
      {
        id: 'template-project-import',
        name: 'Análise Inicial de Repositório',
        schema_version: '1.0',
        content: DEFAULT_PROJECT_IMPORT_PROMPT,
        isDefault: false,
      },
    ];

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('codex_prompt_templates');
        if (saved) {
          const parsed: PromptTemplate[] = JSON.parse(saved);
          // Ensure both templates exist
          const hasImportTemplate = parsed.some(
            (t) => t.id === 'template-project-import' || t.name.toLowerCase().includes('inicial')
          );
          if (!hasImportTemplate) {
            return [...parsed, defaultList[1]];
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Error reading promptTemplates from localStorage', e);
      }
    }
    return defaultList;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('codex_local_operator_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.active && parsed.email === AUTHORIZED_OPERATOR_EMAIL) {
            return getOperatorFallbackProfile();
          }
        }
      } catch (e) {
        console.warn('Error reading local operator session on init', e);
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('codex_local_operator_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.active && parsed.email === AUTHORIZED_OPERATOR_EMAIL) {
            return true;
          }
        }
      } catch (e) {
        console.warn('Error reading local operator auth on init', e);
      }
    }
    return false;
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Subscribe to real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(({ user, isAuthenticated: isAuthed, authError: err }) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(isAuthed);
      }
      if (err) {
        setAuthError(err);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync operational data to localStorage (Auth is strictly managed by Firebase)
  useEffect(() => {
    try {
      localStorage.setItem('codex_projects', JSON.stringify(projects));
      localStorage.setItem('codex_tasks', JSON.stringify(tasks));
      localStorage.setItem('codex_sessions', JSON.stringify(sessions));
      localStorage.setItem('codex_active_session', JSON.stringify(activeSession));
      localStorage.setItem('codex_environments', JSON.stringify(environments));
      localStorage.setItem('codex_history', JSON.stringify(history));
      localStorage.setItem('codex_project_updates', JSON.stringify(projectUpdates));
      localStorage.setItem('codex_prompt_templates', JSON.stringify(promptTemplates));
    } catch (e) {
      console.warn('Error writing to localStorage', e);
    }
  }, [projects, tasks, sessions, activeSession, environments, history, projectUpdates, promptTemplates]);

  const getNowFormatted = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const addHistoryEvent = (event: Omit<HistoryEvent, 'id' | 'timestamp' | 'user'>) => {
    const newEvent: HistoryEvent = {
      ...event,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: getNowFormatted(),
      user: currentUser?.name || 'Marco Aquino',
    };
    setHistory((prev) => [newEvent, ...prev]);
  };

  // Next Mission Derivation
  const getProjectNextTask = (projectId: string): Task | null => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;
    if (project.nextTaskId) {
      const task = tasks.find((t) => t.id === project.nextTaskId);
      if (task) return task;
    }
    const nextFlaggedTask = tasks.find(
      (t) => t.projectId === projectId && t.isNextMission && t.status !== 'Concluída' && t.status !== 'Cancelada'
    );
    if (nextFlaggedTask) return nextFlaggedTask;
    return null;
  };

  const getProjectNextMissionTitle = (project: Project): string => {
    const task = getProjectNextTask(project.id);
    if (task) return task.title;
    return project.nextTaskTitle || project.objective || 'Definição da próxima etapa';
  };

  // Projects CRUD
  const createProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const now = new Date().toISOString();
    const newId = data.identifier || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    let createdTaskId: string | null = data.nextTaskId || null;
    const initialMissionTitle = data.nextTaskTitle || 'Planejamento inicial e setup de arquitetura';

    // If nextTaskId is not provided, create a backing Task for the next mission
    if (!createdTaskId && initialMissionTitle) {
      const initialTaskId = `task-${Date.now()}`;
      createdTaskId = initialTaskId;
      const initialTask: Task = {
        id: initialTaskId,
        projectId: newId,
        projectName: data.name,
        title: initialMissionTitle,
        description: data.nextTaskWhyImportant || 'Definição e execução da primeira missão do projeto.',
        type: 'Feature',
        priority: (data.priority as any) || 'Alta',
        status: 'Pendente',
        assignedTo: currentUser?.name || 'Marco Aquino',
        isNextMission: true,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [initialTask, ...prev]);
    }

    const newProject: Project = {
      ...data,
      id: newId,
      name: data.name,
      description: data.description || '',
      identifier: data.identifier || newId.toUpperCase(),
      type: data.type || 'Projeto Web',
      phase: data.phase || 'Beta Solo',
      status: data.status || 'desenvolvimento',
      health: data.health || 'saudavel',
      progress: typeof data.progress === 'number' ? data.progress : 0,
      objective: data.objective || 'Execução da fase atual do projeto.',
      nextTaskId: createdTaskId,
      nextTaskTitle: initialMissionTitle,
      nextTaskWhyImportant: data.nextTaskWhyImportant || 'Manter o projeto avançando com foco e qualidade.',
      recommendedTool: data.recommendedTool || 'Google AI Studio',
      priority: data.priority || 'Alta',
      mainAccount: data.mainAccount || 'codex.martis.dev@gmail.com',
      statePhoto: data.statePhoto || {
        working: ['Setup inicial'],
        partiallyWorking: [],
        notWorking: [],
        untested: [],
        outOfScope: [],
      },
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [newProject, ...prev]);

    addHistoryEvent({
      type: 'PROJECT_CREATED',
      category: 'PROJETO',
      projectId: newProject.id,
      projectName: newProject.name,
      title: 'PROJETO CRIADO',
      description: `Novo projeto "${newProject.name}" adicionado à central de comando (${newProject.phase}).`,
    });

    return newProject;
  };

  const addProject = (project: Partial<Project> & { name: string }): Project => {
    return createProject(project as any);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: now };
          return updated;
        }
        return p;
      })
    );

    const project = projects.find((p) => p.id === id);
    if (project) {
      addHistoryEvent({
        type: 'PROJECT_UPDATED',
        category: 'PROJETO',
        projectId: id,
        projectName: project.name,
        title: 'PROJETO ATUALIZADO',
        description: `Informações do projeto "${project.name}" foram atualizadas.`,
      });
    }
  };

  const deleteProject = (id: string) => {
    const p = projects.find((x) => x.id === id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
    if (p) {
      addHistoryEvent({
        type: 'PROJECT_UPDATED',
        category: 'PROJETO',
        projectId: id,
        projectName: p.name,
        title: 'PROJETO ENCERRADO/ARQUIVADO',
        description: `Projeto "${p.name}" foi removido do painel ativo.`,
      });
    }
  };

  // Tasks CRUD
  const createTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);

    // Update project updatedAt
    setProjects((prev) =>
      prev.map((p) => (p.id === data.projectId ? { ...p, updatedAt: now } : p))
    );

    addHistoryEvent({
      type: 'TASK_CREATED',
      category: 'TAREFA',
      projectId: data.projectId,
      projectName: data.projectName,
      title: 'TAREFA CRIADA',
      description: `Nova tarefa "${newTask.title}" adicionada com prioridade ${newTask.priority}.`,
    });

    return newTask;
  };

  const addTask = (taskData: any): Task => {
    return createTask(taskData);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    let updatedTaskObj: Task | undefined;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates, updatedAt: now };
          updatedTaskObj = updated;
          return updated;
        }
        return t;
      })
    );

    if (updatedTaskObj) {
      const task = updatedTaskObj;
      
      // If task title updated and it's the next mission for its project, sync fallback nextTaskTitle
      if (updates.title && (task.isNextMission || projects.some((p) => p.nextTaskId === id))) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === task.projectId ? { ...p, nextTaskTitle: updates.title, updatedAt: now } : p
          )
        );
      }

      // If task completed
      if (updates.status === 'Concluída') {
        addHistoryEvent({
          type: 'TASK_COMPLETED',
          category: 'TAREFA',
          projectId: task.projectId,
          projectName: task.projectName,
          title: 'TAREFA CONCLUÍDA',
          description: `Tarefa "${task.title}" marcada como concluída.`,
        });
      } else {
        addHistoryEvent({
          type: 'TASK_UPDATED',
          category: 'TAREFA',
          projectId: task.projectId,
          projectName: task.projectName,
          title: 'TAREFA ATUALIZADA',
          description: `Tarefa "${task.title}" atualizada para status ${task.status}.`,
        });
      }

      // Update project updatedAt
      setProjects((prev) =>
        prev.map((p) => (p.id === task.projectId ? { ...p, updatedAt: now } : p))
      );
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const setTaskAsNextMission = (projectId: string, taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = new Date().toISOString();

    // Mark task as isNextMission and unset others for same project
    setTasks((prev) =>
      prev.map((t) => {
        if (t.projectId === projectId) {
          return { ...t, isNextMission: t.id === taskId, updatedAt: now };
        }
        return t;
      })
    );

    // Update project nextTaskId and nextTaskTitle
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            nextTaskId: taskId,
            nextTaskTitle: task.title,
            updatedAt: now,
          };
        }
        return p;
      })
    );

    addHistoryEvent({
      type: 'NEXT_MISSION_CHANGED',
      category: 'PROJETO',
      projectId,
      projectName: task.projectName,
      title: 'PRÓXIMA MISSÃO DEFINIDA',
      description: `Próxima missão do projeto alterada para: "${task.title}".`,
    });
  };

  // Sessions - Guaranteed single active session
  const startSession = (projectId: string, taskId?: string, customObjective?: string): Session | null => {
    if (activeSession) {
      console.warn('Bloqueio: Já existe uma sessão ativa em andamento.', activeSession);
      return null;
    }

    const project = projects.find((p) => p.id === projectId);
    const task = taskId
      ? tasks.find((t) => t.id === taskId)
      : project?.nextTaskId
      ? tasks.find((t) => t.id === project.nextTaskId)
      : null;
    const nextSessionNum = sessions.length + 1;
    const nowIso = new Date().toISOString();

    const missionTitle = task?.title || project?.nextTaskTitle || `Trabalho no projeto ${project?.name || ''}`;
    const objective = customObjective || missionTitle;

    const newSession: Session = {
      id: `session-${Date.now()}`,
      sessionNumber: nextSessionNum,
      projectId,
      projectName: project?.name || 'Projeto',
      taskId: task?.id,
      taskTitle: task?.title,
      objective,
      startedAt: nowIso,
      status: 'em_andamento',
    };

    setActiveSession(newSession);

    // If task was associated, mark it as "Em andamento"
    if (task && task.status === 'Pendente') {
      updateTask(task.id, { status: 'Em andamento' });
    }

    addHistoryEvent({
      type: 'SESSION_STARTED',
      category: 'SESSAO',
      projectId,
      projectName: project?.name || 'Projeto',
      title: `SESSÃO INICIADA #${nextSessionNum.toString().padStart(3, '0')}`,
      description: `Iniciado trabalho em "${project?.name}": ${objective}`,
    });

    return newSession;
  };

  const finishSession = (arg1: any, arg2?: any) => {
    const nowIso = new Date().toISOString();
    let sessionId: string;
    let details: any;

    if (typeof arg1 === 'string') {
      sessionId = arg1;
      details = arg2 || {};
    } else {
      sessionId = activeSession?.id || '';
      details = arg1 || {};
    }

    const session = activeSession && activeSession.id === sessionId ? activeSession : sessions.find((s) => s.id === sessionId);

    if (!session) return;

    const startedTime = new Date(session.startedAt).getTime();
    const endedTime = new Date(nowIso).getTime();
    const durationSeconds = Math.max(60, Math.floor((endedTime - startedTime) / 1000));

    const finishedSession: Session = {
      ...session,
      ...details,
      endedAt: nowIso,
      durationSeconds,
      status: 'encerrada',
    };

    // Update sessions list
    setSessions((prev) => [finishedSession, ...prev.filter((s) => s.id !== session.id)]);
    setActiveSession(null);

    // If a task was marked as completed
    if (details.completedTaskId) {
      updateTask(details.completedTaskId, { status: 'Concluída' });
    }

    // If a new next mission was set
    if (details.newNextMission && session.projectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === session.projectId) {
            return {
              ...p,
              nextTaskTitle: details.newNextMission!,
              updatedAt: nowIso,
            };
          }
          return p;
        })
      );
    }

    // Record History Event for Session
    addHistoryEvent({
      type: 'SESSION_FINISHED',
      category: 'SESSAO',
      projectId: session.projectId,
      projectName: session.projectName,
      title: `SESSÃO ENCERRADA #${session.sessionNumber.toString().padStart(3, '0')}`,
      description: details.workDone || `Sessão encerrada com resultado: ${details.result}`,
      commitHash: details.commitHash,
    });

    // Record commit event if given
    if (details.commitHash) {
      addHistoryEvent({
        type: 'COMMIT_RECORDED',
        category: 'COMMIT',
        projectId: session.projectId,
        projectName: session.projectName,
        title: `COMMIT ${details.commitHash}`,
        description: details.commitMessage || `Commit registrado na sessão #${session.sessionNumber}`,
        commitHash: details.commitHash,
      });
    }

    // Record deploy event if performed
    if (details.deployDone) {
      addHistoryEvent({
        type: 'DEPLOY_RECORDED',
        category: 'DEPLOY',
        projectId: session.projectId,
        projectName: session.projectName,
        title: `DEPLOY REALIZADO`,
        description: `Deploy registrado para ${session.projectName} após a sessão #${session.sessionNumber}.`,
      });
    }

    // Record decision if documented
    if (details.decisionsTaken) {
      addHistoryEvent({
        type: 'DECISION_RECORDED',
        category: 'DECISAO',
        projectId: session.projectId,
        projectName: session.projectName,
        title: `DECISÃO REGISTRADA`,
        description: details.decisionsTaken,
      });
    }
  };

  const cancelActiveSession = () => {
    setActiveSession(null);
  };

  // Environments
  const createEnvironment = (data: Omit<Environment, 'id' | 'updatedAt'>): Environment => {
    const now = new Date().toISOString();
    const newEnv: Environment = {
      ...data,
      id: `env-${Date.now()}`,
      updatedAt: now,
    };
    setEnvironments((prev) => [newEnv, ...prev]);

    addHistoryEvent({
      type: 'ENVIRONMENT_CREATED',
      category: 'AMBIENTE',
      projectId: data.projectId,
      projectName: data.projectName,
      title: 'AMBIENTE CADASTRADO',
      description: `Novo ambiente/serviço "${data.name}" (${data.service}) cadastrado para ${data.projectName}.`,
    });

    return newEnv;
  };

  const addEnvironment = (env: any): Environment => {
    return createEnvironment(env);
  };

  const updateEnvironment = (id: string, updates: Partial<Environment>) => {
    const now = new Date().toISOString();
    setEnvironments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: now } : e))
    );
  };

  const deleteEnvironment = (id: string) => {
    setEnvironments((prev) => prev.filter((e) => e.id !== id));
  };

  // Prompt Generator
  const getProjectPrompt = (projectId: string, includeContext: boolean): string => {
    const defaultTemplate = promptTemplates.find((t) => t.isDefault)?.content || DEFAULT_GLOBAL_PROMPT_TEMPLATE;
    const project = projects.find((p) => p.id === projectId);

    if (!project) return defaultTemplate;

    if (!includeContext) {
      return defaultTemplate;
    }

    const lastUpdate = projectUpdates.find((u) => u.projectId === projectId);
    return generateCompleteUpdatePrompt(
      project,
      tasks,
      sessions,
      environments,
      history,
      lastUpdate,
      defaultTemplate
    );
  };

  const updateGlobalPromptTemplate = (content: string) => {
    setPromptTemplates((prev) =>
      prev.map((t) => (t.isDefault ? { ...t, content, updatedAt: new Date().toISOString() } : t))
    );
  };

  // JSON Patch Importer & Validator (Project Update Schema 1.0)
  const importProjectUpdateJson = (projectId: string, jsonString: string): UpdateValidationResult => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      return { success: false, error: 'Projeto não encontrado no sistema.' };
    }

    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const projectEnvs = environments.filter((e) => e.projectId === projectId);

    return validateProjectUpdateJson(jsonString, project, projectTasks, projectEnvs);
  };

  const applyParsedUpdate = (projectId: string, diff: ProjectUpdateDiff, rawJsonString?: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const projectEnvs = environments.filter((e) => e.projectId === projectId);
    const otherTasks = tasks.filter((t) => t.projectId !== projectId);
    const otherEnvs = environments.filter((e) => e.projectId !== projectId);

    const parsedData = (diff as any).parsedData || diff || {};

    const result = applyProjectUpdatePatch(
      project,
      projectTasks,
      projectEnvs,
      currentUser,
      parsedData,
      diff,
      rawJsonString
    );

    // 1. Update Project atomically with all patched fields
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...result.updatedProject, updatedAt: now } : p))
    );

    // 2. Update Tasks
    setTasks([...result.updatedTasks, ...otherTasks]);

    // 3. Update Environments
    setEnvironments([...result.updatedEnvironments, ...otherEnvs]);

    // 4. Save Session if recorded
    if (result.newSession) {
      setSessions((prev) => [result.newSession!, ...prev]);
    }

    // 5. Save ProjectUpdate entity
    setProjectUpdates((prev) => [result.newProjectUpdate, ...prev]);

    // 6. Record all generated history events
    for (const evt of result.historyEvents) {
      addHistoryEvent(evt);
    }
  };

  // Validate Project Import JSON
  const validateProjectImport = (jsonString: string): ValidationResult => {
    return validateProjectImportJson(jsonString, projects);
  };

  // Create Project and all associated entities from validated ProjectImportSchema1
  const createProjectFromImport = (
    data: ProjectImportSchema1,
    rawJsonString?: string
  ): { success: boolean; projectId?: string; error?: string } => {
    try {
      const {
        project: newProj,
        tasks: newTasks,
        environments: newEnvs,
        historyEvent,
      } = buildEntitiesFromProjectImport(data, currentUser, rawJsonString);

      // Add Project
      setProjects((prev) => [newProj, ...prev]);

      // Add Tasks
      if (newTasks.length > 0) {
        setTasks((prev) => [...newTasks, ...prev]);
      }

      // Add Environments
      if (newEnvs.length > 0) {
        setEnvironments((prev) => [...newEnvs, ...prev]);
      }

      // Add History Event
      addHistoryEvent({
        type: historyEvent.type,
        category: historyEvent.category,
        projectId: newProj.id,
        projectName: newProj.name,
        title: historyEvent.title,
        description: historyEvent.description,
        commitHash: historyEvent.commitHash,
      });

      return { success: true, projectId: newProj.id };
    } catch (err: any) {
      return { success: false, error: `Falha ao criar projeto: ${err.message}` };
    }
  };

  // Real Firebase Auth functions
  const signInWithGoogleAuth = async () => {
    setAuthError(null);
    const res = await signInWithGoogle();
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      setAuthError(res.error || 'Falha ao autenticar com o Google.');
      return {
        success: false,
        error: res.error,
        isUnauthorizedDomain: res.isUnauthorizedDomain,
      };
    }
  };

  const loginAsAuthorizedOperator = () => {
    const operator = getOperatorFallbackProfile();
    setCurrentUser(operator);
    setIsAuthenticated(true);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'codex_local_operator_session',
          JSON.stringify({ active: true, email: AUTHORIZED_OPERATOR_EMAIL })
        );
      } catch (e) {
        console.warn('Error saving local operator session', e);
      }
    }
    addHistoryEvent({
      type: 'SESSION_STARTED',
      category: 'SESSAO',
      projectId: 'system',
      projectName: 'Codex Martis',
      title: 'ACESSO DE COMANDO CONCEDIDO',
      description: `Operador autorizado (${AUTHORIZED_OPERATOR_EMAIL}) autenticado no Codex Martis.`,
    });
  };

  const login = async (_email?: string, _pass?: string, _isGoogle = true) => {
    const res = await signInWithGoogleAuth();
    return res.success;
  };

  const logout = async () => {
    await logoutUser();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('codex_local_operator_session');
      } catch (e) {}
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const exportDatabaseJson = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      projects,
      tasks,
      sessions,
      environments,
      history,
      projectUpdates,
      promptTemplates,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const loadDemoData = () => {
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setSessions(INITIAL_SESSIONS);
    setActiveSession(null);
    setEnvironments(INITIAL_ENVIRONMENTS);
    setHistory(INITIAL_HISTORY);
    setProjectUpdates([]);
  };

  const resetToInitialSeed = () => {
    setProjects([]);
    setTasks([]);
    setSessions([]);
    setActiveSession(null);
    setEnvironments([]);
    setHistory([]);
    setProjectUpdates([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('codex_projects');
      localStorage.removeItem('codex_tasks');
      localStorage.removeItem('codex_sessions');
      localStorage.removeItem('codex_active_session');
      localStorage.removeItem('codex_environments');
      localStorage.removeItem('codex_history');
      localStorage.removeItem('codex_project_updates');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        projects,
        tasks,
        sessions,
        activeSession,
        environments,
        history,
        projectUpdates,
        promptTemplates,
        currentUser,
        isAuthenticated,
        isAuthLoading,
        authError,
        selectedProjectId,
        setSelectedProjectId,
        getProjectNextTask,
        getProjectNextMissionTitle,
        createProject,
        addProject,
        updateProject,
        deleteProject,
        createTask,
        addTask,
        updateTask,
        deleteTask,
        setTaskAsNextMission,
        startSession,
        finishSession,
        cancelActiveSession,
        createEnvironment,
        addEnvironment,
        updateEnvironment,
        deleteEnvironment,
        addHistoryEvent,
        getProjectPrompt,
        updateGlobalPromptTemplate,
        importProjectUpdateJson,
        applyParsedUpdate,
        validateProjectImport,
        createProjectFromImport,
        signInWithGoogleAuth,
        loginAsAuthorizedOperator,
        login,
        logout,
        clearAuthError,
        exportDatabaseJson,
        loadDemoData,
        resetToInitialSeed,
        resetAllDataToDefault: resetToInitialSeed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
