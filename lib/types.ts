export type ProjectStatus = 'planejamento' | 'desenvolvimento' | 'teste' | 'producao' | 'pausado' | 'encerrado';
export type ProjectHealth = 'saudavel' | 'atencao' | 'bloqueado' | 'nao_avaliado';
export type TaskType = 'Bug' | 'Melhoria' | 'Feature' | 'Auditoria' | 'Infraestrutura' | 'Teste' | 'Documentação' | 'Ideia' | 'Outro';
export type TaskPriority = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type TaskStatus = 'Pendente' | 'Em andamento' | 'Executada não validada' | 'Concluída' | 'Cancelada';

export interface Project {
  id: string;
  name: string;
  identifier: string;
  description: string;
  type: string; // e.g. 'Projeto Web', 'Site Institucional', 'Sistema Interno'
  status: ProjectStatus;
  phase: string; // e.g. 'Beta Solo', 'Planejamento', 'V1.0'
  health: ProjectHealth;
  progress: number; // 0 to 100
  objective: string;
  nextTaskId: string | null;
  nextTaskTitle?: string; // Derived / fallback
  nextTaskWhyImportant?: string;
  recommendedTool?: string;
  priority: string;
  mainAccount?: string;
  statePhoto?: {
    working: string[];
    partiallyWorking: string[];
    notWorking: string[];
    untested: string[];
    outOfScope: string[];
  };
  lastCommit?: string;
  importOrigin?: ProjectImportOrigin;
  contextSummary?: string;
  techStack?: ProjectImportTechStack;
  repositoryInfo?: ProjectImportRepository;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectImportSource {
  type?: string;
  repository_name?: string | null;
  repository_url?: string | null;
  branch_analyzed?: string | null;
  commit_analyzed?: string | null;
  analysis_date?: string | null;
}

export interface ProjectImportProjectInfo {
  name: string;
  identifier?: string | null;
  description?: string | null;
  type?: string | null;
  project_status?: ProjectStatus | string | null;
  project_health?: ProjectHealth | string | null;
  current_phase?: string | null;
  current_objective?: string | null;
  progress?: number | null;
}

export interface ProjectImportRepository {
  owner?: string | null;
  name?: string | null;
  default_branch?: string | null;
  framework?: string | null;
  language?: string[];
  package_manager?: string | null;
}

export interface ProjectImportTechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  authentication?: string[];
  hosting?: string[];
  email?: string[];
  storage?: string[];
  other?: string[];
}

export interface ProjectImportDetectedService {
  service?: string | null;
  category?: string | null;
  evidence?: string | null;
  configuration_status?: 'detected_in_code' | 'configured' | 'not_confirmed' | string | null;
  project_identifier?: string | null;
  url?: string | null;
}

export interface ProjectImportCurrentState {
  working?: string[];
  partially_working?: string[];
  not_working?: string[];
  not_tested?: string[];
  out_of_scope?: string[];
}

export interface ProjectImportInitialTask {
  title: string;
  description?: string | null;
  type?: string | null;
  priority?: string | null;
  status?: string | null;
  evidence?: string | null;
}

export interface ProjectImportIssue {
  title: string;
  description?: string | null;
  severity?: 'critica' | 'alta' | 'media' | 'baixa' | string | null;
  evidence?: string | null;
}

export interface ProjectImportNextAction {
  title: string;
  description?: string | null;
  priority?: string | null;
  recommended_tool?: string | null;
  reason?: string | null;
}

export interface ProjectImportConfidence {
  overall?: string | null;
  limitations?: string[];
}

export interface ProjectImportSchema1 {
  schema_version: '1.0' | string;
  import_type: 'project_creation' | string;
  source?: ProjectImportSource;
  project: ProjectImportProjectInfo;
  repository?: ProjectImportRepository;
  tech_stack?: ProjectImportTechStack;
  detected_services?: ProjectImportDetectedService[];
  current_state?: ProjectImportCurrentState;
  initial_tasks?: ProjectImportInitialTask[];
  issues?: ProjectImportIssue[];
  next_action?: ProjectImportNextAction;
  context_summary?: string | null;
  analysis_confidence?: ProjectImportConfidence;
}

export interface ProjectImportOrigin {
  schemaVersion: string;
  importType: string;
  repositoryUrl?: string;
  repositoryName?: string;
  branchAnalyzed?: string;
  commitAnalyzed?: string;
  analysisDate?: string;
  importedAt: string;
  analysisConfidence?: string;
  limitations?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  isNextMission?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SessionResult = string;

export interface Session {
  id: string;
  sessionNumber: number;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  objective: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  durationMinutes?: number;
  status: 'em_andamento' | 'encerrada';
  workDone?: string;
  result?: SessionResult;
  testsDone?: string;
  commitHash?: string;
  commitMessage?: string;
  deployDone?: boolean;
  problemsFound?: string;
  decisionsTaken?: string;
  decisions?: string[];
  issuesFound?: string[];
  newNextMission?: string;
}

export type HistoryCategory = 'deploy' | 'auditoria' | 'correcao' | 'sessao' | 'configuracao' | 'projeto' | string;

export interface HistoryEvent {
  id: string;
  type?: string;
  projectId?: string;
  projectName?: string;
  title: string;
  details?: string;
  description?: string;
  user?: string;
  timestamp: string;
  commitHash?: string;
  category: HistoryCategory;
}

export type EnvironmentCategory = 
  | 'Produção'
  | 'Desenvolvimento'
  | 'Homologação'
  | 'Banco de Dados'
  | 'Serviço de Terceiros'
  | 'AI Studio' 
  | 'Firebase' 
  | 'GitHub' 
  | 'Vercel' 
  | 'Resend' 
  | 'Cloud Shell' 
  | 'Domínio' 
  | 'Banco' 
  | 'API' 
  | 'Object Storage' 
  | 'Outro'
  | string;

export type EnvironmentStatus = 'Online' | 'Offline' | 'Ativo' | 'Atenção' | 'Inativo' | 'Não avaliado' | string;

export interface Environment {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  badgeCode?: string; // e.g. 'PRD', 'DB', 'STG', 'HML', 'DEV', 'MAIL', 'AUTH', 'OLD'
  category: EnvironmentCategory;
  service: string;
  account: string;
  environmentType?: 'Produção' | 'Desenvolvimento' | 'Homologação' | 'Teste' | 'Outro';
  identifier?: string;
  url?: string;
  status: EnvironmentStatus;
  region?: string;
  provider?: string;
  currentVersion?: string;
  lastDeploy?: string;
  sslStatus?: string;
  domain?: string;
  accessMethod?: string;
  testUser?: string;
  observations?: string;
  updatedAt?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  projectName: string;
  schemaVersion: string;
  updateType?: string;
  originalJson: string;
  rawJson?: string;
  parsedData: any;
  appliedDiff: any;
  source?: string;
  createdAt: string;
  appliedAt: string;
  summary?: string;
}

export interface ProjectUpdateSchemaProject {
  identifier?: string | null;
  project_status?: 'planejamento' | 'desenvolvimento' | 'teste' | 'producao' | 'pausado' | 'encerrado' | string | null;
  project_health?: 'saudavel' | 'atencao' | 'bloqueado' | 'nao_avaliado' | string | null;
  current_phase?: string | null;
  current_objective?: string | null;
  progress?: number | null;
}

export interface ProjectUpdateSchemaSession {
  summary?: string | null;
  result?: 'sucesso' | 'sucesso_parcial' | 'sem_alteracoes' | 'falha' | 'indeterminado' | string | null;
  work_performed?: string[];
  tests_performed?: string[];
  tests_result?: string | null;
}

export interface ProjectUpdateSchemaCompletedTask {
  task_id?: string | null;
  title?: string | null;
  type?: string | null;
  priority?: string | null;
  status?: 'concluida' | string | null;
  description?: string | null;
}

export interface ProjectUpdateSchemaUpdatedTask {
  task_id?: string | null;
  title?: string | null;
  type?: string | null;
  priority?: string | null;
  previous_status?: string | null;
  status?: string | null;
  description?: string | null;
}

export interface ProjectUpdateSchemaNewTask {
  title: string;
  type?: string | null;
  priority?: string | null;
  status?: 'pendente' | string | null;
  description?: string | null;
}

export interface ProjectUpdateSchemaIssue {
  title: string;
  severity?: 'critica' | 'alta' | 'media' | 'baixa' | string | null;
  status?: 'aberto' | 'em_correcao' | 'corrigido_nao_validado' | 'resolvido' | 'aceito' | 'descartado' | string | null;
  description?: string | null;
  evidence?: string | null;
}

export interface ProjectUpdateSchemaResolvedIssue {
  title: string;
  severity?: string | null;
  status?: 'resolvido' | string | null;
  resolution?: string | null;
  validation?: string | null;
}

export interface ProjectUpdateSchemaDecision {
  title: string;
  decision?: string | null;
  reason?: string | null;
  impact?: string | null;
}

export interface ProjectUpdateSchemaTechnicalChange {
  area?: string | null;
  description?: string | null;
  status?: string | null;
}

export interface ProjectUpdateSchemaEnvironmentChange {
  environment_id?: string | null;
  service?: string | null;
  environment?: string | null;
  change?: string | null;
  result?: string | null;
}

export interface ProjectUpdateSchemaRepository {
  repository_name?: string | null;
  branch?: string | null;
  commit?: string | null;
  commit_message?: string | null;
  commit_status?: string | null;
}

export interface ProjectUpdateSchemaDeployment {
  performed?: boolean | null;
  platform?: string | null;
  environment?: string | null;
  url?: string | null;
  status?: string | null;
}

export interface ProjectUpdateSchemaKnownState {
  working?: string[];
  partially_working?: string[];
  not_working?: string[];
  not_tested?: string[];
  out_of_scope?: string[];
}

export interface ProjectUpdateSchemaNextAction {
  task_id?: string | null;
  title?: string | null;
  description?: string | null;
  priority?: string | null;
  recommended_tool?: string | null;
  reason?: string | null;
}

export interface ProjectUpdateSchema1 {
  schema_version: '1.0' | string;
  update_type: 'project_update' | string;
  project?: ProjectUpdateSchemaProject | null;
  session?: ProjectUpdateSchemaSession | null;
  completed_tasks?: ProjectUpdateSchemaCompletedTask[];
  updated_tasks?: ProjectUpdateSchemaUpdatedTask[];
  new_tasks?: ProjectUpdateSchemaNewTask[];
  issues?: ProjectUpdateSchemaIssue[];
  resolved_issues?: ProjectUpdateSchemaResolvedIssue[];
  decisions?: ProjectUpdateSchemaDecision[];
  technical_changes?: ProjectUpdateSchemaTechnicalChange[];
  environment_changes?: ProjectUpdateSchemaEnvironmentChange[];
  repository?: ProjectUpdateSchemaRepository | null;
  deployment?: ProjectUpdateSchemaDeployment | null;
  known_state?: ProjectUpdateSchemaKnownState | null;
  next_action?: ProjectUpdateSchemaNextAction | null;
  recommended_follow_up?: string[];
  context_summary?: string | null;
}

export interface PromptTemplate {
  id: string;
  name: string;
  schema_version: string;
  content: string;
  isDefault: boolean;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

export type { ProjectUpdateDiff, UpdateValidationResult, TaskMatchResult } from './projectUpdate';

