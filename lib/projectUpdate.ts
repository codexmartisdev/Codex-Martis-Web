import {
  Project,
  Task,
  Environment,
  HistoryEvent,
  ProjectStatus,
  ProjectHealth,
  TaskPriority,
  TaskType,
  TaskStatus,
  Session,
  ProjectUpdate,
  ProjectUpdateSchema1,
  ProjectUpdateSchemaProject,
  ProjectUpdateSchemaSession,
  ProjectUpdateSchemaCompletedTask,
  ProjectUpdateSchemaUpdatedTask,
  ProjectUpdateSchemaNewTask,
  ProjectUpdateSchemaIssue,
  ProjectUpdateSchemaResolvedIssue,
  ProjectUpdateSchemaDecision,
  ProjectUpdateSchemaTechnicalChange,
  ProjectUpdateSchemaEnvironmentChange,
  ProjectUpdateSchemaRepository,
  ProjectUpdateSchemaDeployment,
  ProjectUpdateSchemaKnownState,
  ProjectUpdateSchemaNextAction,
  UserProfile,
} from './types';
import { DEFAULT_PROJECT_UPDATE_PROMPT } from './constants/prompts';

export interface TaskMatchResult {
  providedTitle?: string | null;
  providedTaskId?: string | null;
  matchedTask?: Task;
  isAmbiguous?: boolean;
  ambiguousCandidates?: Task[];
  action: 'complete' | 'update' | 'create' | 'unmatched';
  fieldChanges?: {
    status?: { from: TaskStatus; to: TaskStatus };
    priority?: { from: TaskPriority; to: TaskPriority };
    type?: { from: TaskType; to: TaskType };
    description?: { from: string; to: string };
  };
  newTaskData?: ProjectUpdateSchemaNewTask | ProjectUpdateSchemaIssue;
}

export interface ProjectUpdateDiff {
  projectId: string;
  projectName: string;
  projectIdentifier?: string;
  schemaVersion: string;
  updateType: string;

  // Project Fields
  health: {
    current: ProjectHealth;
    new: ProjectHealth;
    changed: boolean;
  };
  status: {
    current: ProjectStatus;
    new: ProjectStatus;
    changed: boolean;
  };
  phase: {
    current: string;
    new: string;
    changed: boolean;
  };
  progress: {
    current: number;
    new: number;
    changed: boolean;
  };
  objective: {
    current: string;
    new: string;
    changed: boolean;
  };

  // Next Mission
  nextMission: {
    currentTitle: string;
    currentTaskId: string | null;
    newTitle: string;
    newTaskId: string | null;
    new?: string; // UI alias
    whyImportant?: string | null;
    recommendedTool?: string | null;
    changed: boolean;
    resolutionSource: 'task_id' | 'existing_task_match' | 'new_task_match' | 'created_new_task' | 'unchanged';
  };

  // Task Operations
  completedTasksMatches: TaskMatchResult[];
  completedTasks?: Array<{ title: string; matchedTaskId?: string | null }>;
  updatedTasksMatches: TaskMatchResult[];
  updatedTasks?: Array<{ title: string; matchedTaskId?: string | null; changes: Record<string, string> }>;
  newTasksToCreate: ProjectUpdateSchemaNewTask[];
  newTasks?: ProjectUpdateSchemaNewTask[];
  issuesToCreate: ProjectUpdateSchemaIssue[];
  issues?: ProjectUpdateSchemaIssue[];
  resolvedIssues: ProjectUpdateSchemaResolvedIssue[];

  // Decisions & Tech Changes
  decisions: ProjectUpdateSchemaDecision[];
  technicalChanges: ProjectUpdateSchemaTechnicalChange[];
  environmentChanges: Array<{
    envId?: string | null;
    matchedEnv?: Environment;
    service?: string | null;
    environment?: string | null;
    change?: string | null;
    result?: string | null;
    isAmbiguous?: boolean;
  }>;

  // Repository & Deployment
  repository?: ProjectUpdateSchemaRepository | null;
  commit?: { hash: string; message?: string } | null;
  deployment?: ProjectUpdateSchemaDeployment | null;
  deploy?: ProjectUpdateSchemaDeployment | null;

  // Known State & Context
  knownState?: {
    working: string[];
    partiallyWorking: string[];
    notWorking: string[];
    untested: string[];
    outOfScope: string[];
    hasChanges: boolean;
  } | null;

  contextSummary?: string | null;
  sessionData?: ProjectUpdateSchemaSession | null;
  recommendedFollowUp?: string[];

  // Metadata & Parsed Data
  rawJsonString: string;
  hasRemovedSecrets?: boolean;
  parsedData?: any;
}

export interface UpdateValidationResult {
  success: boolean;
  error?: string;
  parsedData?: ProjectUpdateSchema1;
  diff?: ProjectUpdateDiff;
  hasRemovedSecrets?: boolean;
  rawJsonString?: string;
}

// Regex to detect and remove secrets without eval
const SENSITIVE_PATTERNS = [
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/gi,
  /(?:bearer\s+|token\s*[:=]\s*|api[_-]?key\s*[:=]\s*|secret\s*[:=]\s*|password\s*[:=]\s*|pwd\s*[:=]\s*)["']?([a-zA-Z0-9_\-\.]{20,})["']?/gi,
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT
  /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
];

/**
 * Deep sanitization of unsafe strings or secrets
 */
function sanitizeSecrets(obj: any): { sanitized: any; removedCount: number } {
  let removedCount = 0;

  function recurse(val: any): any {
    if (typeof val === 'string') {
      let res = val;
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(res)) {
          removedCount++;
          res = res.replace(pattern, '[REMOVIDO POR SEGURANÇA]');
        }
      }
      return res;
    } else if (Array.isArray(val)) {
      return val.map(recurse);
    } else if (val !== null && typeof val === 'object') {
      const copy: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('secret') ||
          lowerKey.includes('password') ||
          lowerKey.includes('private_key') ||
          lowerKey.includes('apikey') ||
          lowerKey.includes('token')
        ) {
          if (typeof val[key] === 'string' && val[key].length > 10) {
            removedCount++;
            copy[key] = '[REMOVIDO POR SEGURANÇA]';
            continue;
          }
        }
        copy[key] = recurse(val[key]);
      }
      return copy;
    }
    return val;
  }

  const sanitized = recurse(obj);
  return { sanitized, removedCount };
}

/**
 * Normalized string matching helper (accent and case insensitive)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function normalizeEnumString(str?: string | null): string {
  if (!str) return '';
  return normalizeString(str).replace(/[\s-]+/g, '_');
}

/**
 * Maps project health from any variation
 */
export function normalizeProjectHealth(h?: string | null): ProjectHealth | undefined {
  if (!h) return undefined;
  const n = normalizeEnumString(h);
  if (n.includes('saudavel') || n === 'ok' || n === 'verde' || n === 'healthy') return 'saudavel';
  if (n.includes('atencao') || n.includes('warning') || n === 'amarelo' || n === 'caution') return 'atencao';
  if (n.includes('bloqueado') || n.includes('blocked') || n.includes('erro') || n === 'vermelho' || n.includes('critico')) return 'bloqueado';
  if (n.includes('nao_avaliado') || n.includes('unassessed') || n.includes('desconhecido')) return 'nao_avaliado';
  return undefined;
}

/**
 * Maps project status from any variation
 */
export function normalizeProjectStatus(s?: string | null): ProjectStatus | undefined {
  if (!s) return undefined;
  const n = normalizeEnumString(s);
  if (n.includes('planejamento') || n.includes('planning') || n.includes('iniciando')) return 'planejamento';
  if (n.includes('desenvolvimento') || n.includes('development') || n.includes('andamento') || n.includes('dev')) return 'desenvolvimento';
  if (n.includes('teste') || n.includes('qa') || n.includes('homologacao') || n.includes('staging')) return 'teste';
  if (n.includes('producao') || n.includes('production') || n.includes('prd') || n.includes('live') || n.includes('ativo')) return 'producao';
  if (n.includes('pausado') || n.includes('paused') || n.includes('hold') || n.includes('espera')) return 'pausado';
  if (n.includes('encerrado') || n.includes('arquivado') || n.includes('closed') || n.includes('finalizado')) return 'encerrado';
  return undefined;
}

/**
 * Maps schema task status to Codex Martis TaskStatus
 */
export function mapSchemaTaskStatus(status?: string | null): TaskStatus {
  if (!status) return 'Pendente';
  const s = normalizeEnumString(status);
  if (s.includes('concluid') || s === 'done' || s === 'completed' || s === 'finalizada') return 'Concluída';
  if (s.includes('executada') || s.includes('unvalidated') || s.includes('aguardando_validacao')) return 'Executada não validada';
  if (s.includes('andamento') || s.includes('progress') || s === 'doing' || s === 'executando') return 'Em andamento';
  if (s.includes('cancelad') || s === 'cancelled') return 'Cancelada';
  return 'Pendente';
}

/**
 * Maps schema task type to Codex Martis TaskType
 */
export function mapSchemaTaskType(type?: string | null): TaskType {
  if (!type) return 'Melhoria';
  const t = normalizeEnumString(type);
  if (t.includes('bug') || t.includes('erro') || t.includes('fix') || t.includes('correcao')) return 'Bug';
  if (t.includes('feature') || t.includes('recurso') || t.includes('funcionalidade')) return 'Feature';
  if (t.includes('auditoria') || t.includes('audit') || t.includes('revisao')) return 'Auditoria';
  if (t.includes('infra') || t.includes('banco') || t.includes('cloud') || t.includes('deploy') || t.includes('devops')) return 'Infraestrutura';
  if (t.includes('test') || t.includes('qa')) return 'Teste';
  if (t.includes('doc') || t.includes('documentacao')) return 'Documentação';
  if (t.includes('ideia') || t.includes('idea')) return 'Ideia';
  if (t.includes('outro') || t.includes('other')) return 'Outro';
  return 'Melhoria';
}

/**
 * Maps schema priority / severity to Codex Martis TaskPriority
 */
export function mapSchemaPriority(p?: string | null): TaskPriority {
  if (!p) return 'Média';
  const norm = normalizeEnumString(p);
  if (norm.includes('critica') || norm.includes('urgente') || norm.includes('blocker') || norm.includes('imediata')) return 'Crítica';
  if (norm.includes('alta') || norm.includes('high')) return 'Alta';
  if (norm.includes('baixa') || norm.includes('low')) return 'Baixa';
  return 'Média';
}

/**
 * Normalizes any raw JSON object into canonical ProjectUpdateSchema1
 */
export function normalizeProjectUpdateData(raw: any): ProjectUpdateSchema1 {
  if (!raw || typeof raw !== 'object') {
    return { schema_version: '1.0', update_type: 'project_update' };
  }

  const projRaw = raw.project || {};

  // Health
  const rawHealth = projRaw.project_health || projRaw.health || raw.project_health || raw.health || raw.status_health;
  const project_health = normalizeProjectHealth(rawHealth) || undefined;

  // Status
  const rawStatus = projRaw.project_status || projRaw.status || raw.project_status || raw.status;
  const project_status = normalizeProjectStatus(rawStatus) || undefined;

  // Phase
  const current_phase = projRaw.current_phase || projRaw.phase || raw.current_phase || raw.phase || undefined;

  // Progress
  let progress: number | undefined = undefined;
  const rawProg = projRaw.progress !== undefined ? projRaw.progress : (raw.progress !== undefined ? raw.progress : raw.project_progress);
  if (rawProg !== undefined && rawProg !== null && rawProg !== '') {
    const pNum = Number(rawProg);
    if (!isNaN(pNum)) {
      progress = Math.max(0, Math.min(100, Math.round(pNum)));
    }
  }

  // Objective / Status Summary
  const current_objective =
    projRaw.current_objective ||
    projRaw.objective ||
    raw.current_objective ||
    raw.objective ||
    raw.status_summary ||
    raw.summary ||
    undefined;

  // Identifier / Project ID
  const identifier =
    projRaw.identifier ||
    projRaw.id ||
    raw.project_identifier ||
    raw.project_id ||
    raw.identifier ||
    raw.id ||
    undefined;

  // Next Mission / Next Action
  const nextRaw = raw.next_action || raw.next_mission || raw.next_task || raw.nextAction || raw.nextMission || raw.nextTask;
  let next_action: ProjectUpdateSchemaNextAction | undefined = undefined;
  if (typeof nextRaw === 'string' && nextRaw.trim()) {
    next_action = { title: nextRaw.trim() };
  } else if (nextRaw && typeof nextRaw === 'object') {
    next_action = {
      task_id: nextRaw.task_id || nextRaw.id || undefined,
      title: nextRaw.title || nextRaw.name || undefined,
      description: nextRaw.description || nextRaw.why_important || nextRaw.reason || undefined,
      reason: nextRaw.why_important || nextRaw.reason || nextRaw.description || undefined,
      recommended_tool: nextRaw.recommended_tool || nextRaw.tool || undefined,
      priority: nextRaw.priority || undefined,
    };
  }

  // Completed Tasks
  const completed_tasks: ProjectUpdateSchemaCompletedTask[] = [];
  const rawCompleted = raw.completed_tasks || raw.completedTasks || raw.done_tasks;
  if (Array.isArray(rawCompleted)) {
    for (const ct of rawCompleted) {
      if (typeof ct === 'string' && ct.trim()) {
        completed_tasks.push({ title: ct.trim(), status: 'concluida' });
      } else if (ct && typeof ct === 'object') {
        const title = ct.title || ct.name || ct.task_title;
        if (title || ct.task_id || ct.id) {
          completed_tasks.push({
            task_id: ct.task_id || ct.id || null,
            title: title || null,
            type: ct.type || null,
            priority: ct.priority || null,
            status: 'concluida',
            description: ct.description || null,
          });
        }
      }
    }
  }

  // Updated Tasks
  const updated_tasks: ProjectUpdateSchemaUpdatedTask[] = [];
  const rawUpdated = raw.updated_tasks || raw.updatedTasks;
  if (Array.isArray(rawUpdated)) {
    for (const ut of rawUpdated) {
      if (typeof ut === 'string' && ut.trim()) {
        updated_tasks.push({ title: ut.trim() });
      } else if (ut && typeof ut === 'object') {
        const title = ut.title || ut.name;
        if (title || ut.task_id || ut.id) {
          updated_tasks.push({
            task_id: ut.task_id || ut.id || null,
            title: title || null,
            type: ut.type || null,
            priority: ut.priority || null,
            previous_status: ut.previous_status || null,
            status: ut.status || null,
            description: ut.description || null,
          });
        }
      }
    }
  }

  // New Tasks
  const new_tasks: ProjectUpdateSchemaNewTask[] = [];
  const rawNew = raw.new_tasks || raw.newTasks || raw.created_tasks;
  if (Array.isArray(rawNew)) {
    for (const nt of rawNew) {
      if (typeof nt === 'string' && nt.trim()) {
        new_tasks.push({ title: nt.trim(), type: 'Feature', priority: 'Alta', status: 'pendente' });
      } else if (nt && typeof nt === 'object') {
        const title = nt.title || nt.name;
        if (title && String(title).trim()) {
          new_tasks.push({
            title: String(title).trim(),
            type: nt.type || 'Feature',
            priority: nt.priority || 'Alta',
            status: nt.status || 'pendente',
            description: nt.description || '',
          });
        }
      }
    }
  }

  // Issues
  const issues: ProjectUpdateSchemaIssue[] = [];
  const rawIssues = raw.issues || raw.problems || raw.bugs || raw.risks;
  if (Array.isArray(rawIssues)) {
    for (const is of rawIssues) {
      if (typeof is === 'string' && is.trim()) {
        issues.push({ title: is.trim(), severity: 'media', status: 'aberto' });
      } else if (is && typeof is === 'object') {
        const title = is.title || is.name || is.description;
        if (title && String(title).trim()) {
          issues.push({
            title: String(title).trim(),
            severity: is.severity || is.priority || 'media',
            status: is.status || 'aberto',
            description: is.description || '',
            evidence: is.evidence || '',
          });
        }
      }
    }
  }

  // Resolved Issues
  const resolved_issues: ProjectUpdateSchemaResolvedIssue[] = [];
  const rawResolved = raw.resolved_issues || raw.resolvedIssues || raw.fixed_issues;
  if (Array.isArray(rawResolved)) {
    for (const ri of rawResolved) {
      if (typeof ri === 'string' && ri.trim()) {
        resolved_issues.push({ title: ri.trim(), status: 'resolvido' });
      } else if (ri && typeof ri === 'object') {
        const title = ri.title || ri.name;
        if (title && String(title).trim()) {
          resolved_issues.push({
            title: String(title).trim(),
            severity: ri.severity || 'media',
            status: 'resolvido',
            resolution: ri.resolution || ri.solution || '',
            validation: ri.validation || '',
          });
        }
      }
    }
  }

  // Decisions
  const decisions: ProjectUpdateSchemaDecision[] = [];
  const rawDecisions = raw.decisions || raw.strategic_decisions;
  if (Array.isArray(rawDecisions)) {
    for (const dec of rawDecisions) {
      if (typeof dec === 'string' && dec.trim()) {
        decisions.push({ title: dec.trim(), decision: dec.trim() });
      } else if (dec && typeof dec === 'object') {
        const title = dec.title || dec.decision || dec.name;
        if (title && String(title).trim()) {
          decisions.push({
            title: String(title).trim(),
            decision: dec.decision || dec.title || '',
            reason: dec.reason || dec.why || '',
            impact: dec.impact || '',
          });
        }
      }
    }
  }

  // Technical Changes (Support both Array and Object format)
  const technical_changes: ProjectUpdateSchemaTechnicalChange[] = [];
  const rawTech = raw.technical_changes || raw.technicalChanges;
  if (Array.isArray(rawTech)) {
    for (const tc of rawTech) {
      if (typeof tc === 'string' && tc.trim()) {
        technical_changes.push({ area: 'Geral', description: tc.trim(), status: 'aplicado' });
      } else if (tc && typeof tc === 'object') {
        technical_changes.push({
          area: tc.area || tc.category || tc.scope || 'Código',
          description: tc.description || tc.details || tc.change || '',
          status: tc.status || 'aplicado',
        });
      }
    }
  } else if (rawTech && typeof rawTech === 'object') {
    if (Array.isArray(rawTech.modified_files) && rawTech.modified_files.length > 0) {
      technical_changes.push({
        area: 'Arquivos Modificados',
        description: rawTech.modified_files.join(', '),
        status: 'aplicado',
      });
    }
    if (Array.isArray(rawTech.added_libraries) && rawTech.added_libraries.length > 0) {
      technical_changes.push({
        area: 'Bibliotecas Adicionadas',
        description: rawTech.added_libraries.join(', '),
        status: 'aplicado',
      });
    }
    if (Array.isArray(rawTech.configuration_changes) && rawTech.configuration_changes.length > 0) {
      technical_changes.push({
        area: 'Configurações',
        description: rawTech.configuration_changes.join(', '),
        status: 'aplicado',
      });
    }
  }

  // Environments / Environment Changes
  const environment_changes: ProjectUpdateSchemaEnvironmentChange[] = [];
  const rawEnvs = raw.environment_changes || raw.environments || raw.environmentChanges;
  if (Array.isArray(rawEnvs)) {
    for (const ec of rawEnvs) {
      if (typeof ec === 'string' && ec.trim()) {
        environment_changes.push({ change: ec.trim(), result: 'OK' });
      } else if (ec && typeof ec === 'object') {
        environment_changes.push({
          environment_id: ec.environment_id || ec.identifier || ec.id || null,
          service: ec.service || ec.name || null,
          environment: ec.environment || ec.status || null,
          change: ec.change || ec.observations || ec.details || null,
          result: ec.result || ec.status || 'OK',
        });
      }
    }
  }

  // Repository
  let repository: ProjectUpdateSchemaRepository | undefined = undefined;
  const rawRepo = raw.repository || raw.repo || raw.git;
  if (rawRepo && typeof rawRepo === 'object') {
    repository = {
      repository_name: rawRepo.repository_name || rawRepo.name || null,
      branch: rawRepo.branch || null,
      commit: rawRepo.commit || rawRepo.hash || rawRepo.commitHash || null,
      commit_message: rawRepo.commit_message || rawRepo.message || null,
      commit_status: rawRepo.commit_status || null,
    };
  }

  // Deployment
  let deployment: ProjectUpdateSchemaDeployment | undefined = undefined;
  const rawDep = raw.deployment || raw.deploy;
  if (rawDep && typeof rawDep === 'object') {
    deployment = {
      performed: Boolean(rawDep.performed !== false && (rawDep.url || rawDep.environment || rawDep.platform || rawDep.performed === true)),
      platform: rawDep.platform || null,
      environment: rawDep.environment || null,
      url: rawDep.url || null,
      status: rawDep.status || null,
    };
  }

  // Known State / State Photo
  let known_state: ProjectUpdateSchemaKnownState | undefined = undefined;
  const rawKS = raw.known_state || raw.knownState || raw.state_photo || raw.statePhoto;
  if (rawKS && typeof rawKS === 'object') {
    known_state = {
      working: Array.isArray(rawKS.working) ? rawKS.working : [],
      partially_working: Array.isArray(rawKS.partially_working) ? rawKS.partially_working : (Array.isArray(rawKS.partiallyWorking) ? rawKS.partiallyWorking : []),
      not_working: Array.isArray(rawKS.not_working) ? rawKS.not_working : (Array.isArray(rawKS.notWorking) ? rawKS.notWorking : []),
      not_tested: Array.isArray(rawKS.not_tested) ? rawKS.not_tested : (Array.isArray(rawKS.untested) ? rawKS.untested : []),
      out_of_scope: Array.isArray(rawKS.out_of_scope) ? rawKS.out_of_scope : (Array.isArray(rawKS.outOfScope) ? rawKS.outOfScope : []),
    };
  }

  // Session
  let session: ProjectUpdateSchemaSession | undefined = undefined;
  const rawSess = raw.session || raw.session_summary || raw.sessionSummary;
  if (rawSess && typeof rawSess === 'object') {
    session = {
      summary: rawSess.summary || rawSess.objective || raw.status_summary || null,
      result: rawSess.result || 'sucesso',
      work_performed: Array.isArray(rawSess.work_performed) ? rawSess.work_performed : (Array.isArray(rawSess.work_done) ? rawSess.work_done : []),
      tests_performed: Array.isArray(rawSess.tests_performed) ? rawSess.tests_performed : [],
      tests_result: rawSess.tests_result || null,
    };
  } else if (raw.status_summary || raw.summary) {
    session = {
      summary: raw.status_summary || raw.summary,
      result: 'sucesso',
      work_performed: [],
      tests_performed: [],
    };
  }

  // Context Summary
  const context_summary = raw.context_summary || raw.contextSummary || raw.summary || undefined;

  // Recommended follow up
  const recommended_follow_up = Array.isArray(raw.recommended_follow_up) ? raw.recommended_follow_up : [];

  return {
    schema_version: '1.0',
    update_type: 'project_update',
    project: {
      identifier: identifier || null,
      project_status: (project_status as any) || null,
      project_health: (project_health as any) || null,
      current_phase: current_phase || null,
      current_objective: current_objective || null,
      progress: progress !== undefined ? progress : null,
    },
    session: session || null,
    completed_tasks,
    updated_tasks,
    new_tasks,
    issues,
    resolved_issues,
    decisions,
    technical_changes,
    environment_changes,
    repository: repository || null,
    deployment: deployment || null,
    known_state: known_state || null,
    next_action: next_action || null,
    recommended_follow_up,
    context_summary: context_summary || null,
  };
}

/**
 * Task matching algorithm:
 * 1. task_id exact match
 * 2. exact title match
 * 3. normalized title match
 */
export function matchTaskInProject(
  providedTaskId: string | null | undefined,
  providedTitle: string | null | undefined,
  projectTasks: Task[]
): { matched?: Task; isAmbiguous: boolean; candidates: Task[] } {
  // 1. Match by task_id
  if (providedTaskId && providedTaskId.trim()) {
    const byId = projectTasks.find(
      (t) => t.id.toLowerCase() === providedTaskId.trim().toLowerCase()
    );
    if (byId) {
      return { matched: byId, isAmbiguous: false, candidates: [byId] };
    }
  }

  // 2. Match by exact title
  if (providedTitle && providedTitle.trim()) {
    const exactMatches = projectTasks.filter(
      (t) => t.title.trim() === providedTitle.trim()
    );
    if (exactMatches.length === 1) {
      return { matched: exactMatches[0], isAmbiguous: false, candidates: exactMatches };
    } else if (exactMatches.length > 1) {
      return { matched: undefined, isAmbiguous: true, candidates: exactMatches };
    }

    // 3. Match by normalized title
    const norm = normalizeString(providedTitle);
    const normMatches = projectTasks.filter(
      (t) => normalizeString(t.title) === norm
    );
    if (normMatches.length === 1) {
      return { matched: normMatches[0], isAmbiguous: false, candidates: normMatches };
    } else if (normMatches.length > 1) {
      return { matched: undefined, isAmbiguous: true, candidates: normMatches };
    }
  }

  return { matched: undefined, isAmbiguous: false, candidates: [] };
}

/**
 * Validates a JSON string against CODEX MARTIS PROJECT UPDATE SCHEMA 1.0
 */
export function validateProjectUpdateJson(
  jsonString: string,
  currentProject: Project,
  projectTasks: Task[] = [],
  projectEnvironments: Environment[] = []
): UpdateValidationResult {
  try {
    let clean = jsonString.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    if (!clean) {
      return { success: false, error: 'JSON não fornecido. Cole o conteúdo JSON para validação.' };
    }

    let parsedRaw: any;
    try {
      parsedRaw = JSON.parse(clean);
    } catch (parseErr: any) {
      return { success: false, error: `JSON inválido: ${parseErr.message}` };
    }

    if (!parsedRaw || typeof parsedRaw !== 'object' || Array.isArray(parsedRaw)) {
      return { success: false, error: 'O JSON fornecido deve ser um objeto JSON válido.' };
    }

    // Validate update_type if explicit project_creation
    if (parsedRaw.update_type === 'project_creation' || parsedRaw.import_type === 'project_creation') {
      return {
        success: false,
        error: 'Este JSON pertence ao fluxo de criação inicial de projeto (Project Import), não ao de atualização (Project Update).',
      };
    }

    // Sanitize any secrets
    const { sanitized, removedCount } = sanitizeSecrets(parsedRaw);

    // Normalize full payload to standard Schema 1.0
    const parsedData: ProjectUpdateSchema1 = normalizeProjectUpdateData(sanitized);

    // Check project identifier matching if supplied
    if (parsedData.project?.identifier) {
      const pIdent = normalizeString(parsedData.project.identifier);
      const curIdent = normalizeString(currentProject.identifier || '');
      const curId = normalizeString(currentProject.id);
      const curName = normalizeString(currentProject.name);

      if (
        pIdent &&
        pIdent !== curIdent &&
        pIdent !== curId &&
        !curIdent.includes(pIdent) &&
        !curName.includes(pIdent)
      ) {
        return {
          success: false,
          error: `O identificador informado ("${parsedData.project.identifier}") não corresponde ao projeto atual ("${currentProject.name}" - ${currentProject.identifier}).`,
        };
      }
    }

    // Build comprehensive Diff object for preview
    const diff = buildProjectUpdateDiff(
      currentProject,
      projectTasks,
      projectEnvironments,
      parsedData,
      clean,
      removedCount > 0
    );

    diff.parsedData = parsedData;

    return {
      success: true,
      parsedData,
      diff,
      hasRemovedSecrets: removedCount > 0,
      rawJsonString: clean,
    };
  } catch (err: any) {
    return { success: false, error: `Falha ao validar JSON: ${err.message}` };
  }
}

/**
 * Builds a comprehensive diff preview comparing current state with incoming patch
 */
export function buildProjectUpdateDiff(
  project: Project,
  tasks: Task[],
  environments: Environment[],
  data: ProjectUpdateSchema1,
  rawJsonString: string,
  hasRemovedSecrets = false
): ProjectUpdateDiff {
  // 1. Health Diff
  const newHealth = data.project?.project_health
    ? (data.project.project_health as ProjectHealth)
    : project.health;
  const healthChanged = Boolean(data.project?.project_health && newHealth !== project.health);

  // 2. Status Diff
  const newStatus = data.project?.project_status
    ? (data.project.project_status as ProjectStatus)
    : project.status;
  const statusChanged = Boolean(data.project?.project_status && newStatus !== project.status);

  // 3. Phase Diff
  const newPhase = data.project?.current_phase ? data.project.current_phase.trim() : project.phase;
  const phaseChanged = Boolean(data.project?.current_phase && newPhase !== project.phase);

  // 4. Progress Diff
  const newProgress =
    data.project?.progress !== undefined && data.project?.progress !== null
      ? Number(data.project.progress)
      : project.progress;
  const progressChanged = Boolean(
    data.project?.progress !== undefined &&
      data.project?.progress !== null &&
      newProgress !== project.progress
  );

  // 5. Objective Diff
  const newObjective = data.project?.current_objective
    ? data.project.current_objective.trim()
    : project.objective;
  const objectiveChanged = Boolean(
    data.project?.current_objective && newObjective !== project.objective
  );

  // 6. Next Mission Diff & Resolution
  const currentMissionTask = project.nextTaskId
    ? tasks.find((t) => t.id === project.nextTaskId)
    : null;
  const currentMissionTitle = currentMissionTask
    ? currentMissionTask.title
    : project.nextTaskTitle || 'Nenhuma missão definida';

  let nextMissionTitle = currentMissionTitle;
  let nextMissionTaskId: string | null = project.nextTaskId || null;
  let nextMissionChanged = false;
  let nextMissionResolutionSource:
    | 'task_id'
    | 'existing_task_match'
    | 'new_task_match'
    | 'created_new_task'
    | 'unchanged' = 'unchanged';

  if (data.next_action?.title || data.next_action?.task_id) {
    const reqTitle = data.next_action.title ? data.next_action.title.trim() : '';
    const reqId = data.next_action.task_id ? data.next_action.task_id.trim() : null;

    if (reqId) {
      const match = tasks.find((t) => t.id.toLowerCase() === reqId.toLowerCase());
      if (match) {
        nextMissionTaskId = match.id;
        nextMissionTitle = reqTitle || match.title;
        nextMissionResolutionSource = 'task_id';
        nextMissionChanged = nextMissionTaskId !== project.nextTaskId;
      }
    }

    if (!nextMissionChanged && reqTitle) {
      const titleMatch = matchTaskInProject(null, reqTitle, tasks);
      if (titleMatch.matched) {
        nextMissionTaskId = titleMatch.matched.id;
        nextMissionTitle = titleMatch.matched.title;
        nextMissionResolutionSource = 'existing_task_match';
        nextMissionChanged =
          nextMissionTaskId !== project.nextTaskId ||
          normalizeString(nextMissionTitle) !== normalizeString(currentMissionTitle);
      } else {
        const inNewTasks = (data.new_tasks || []).find(
          (nt) => normalizeString(nt.title) === normalizeString(reqTitle)
        );
        if (inNewTasks) {
          nextMissionTaskId = null;
          nextMissionTitle = inNewTasks.title;
          nextMissionResolutionSource = 'new_task_match';
          nextMissionChanged = true;
        } else {
          nextMissionTaskId = null;
          nextMissionTitle = reqTitle;
          nextMissionResolutionSource = 'created_new_task';
          nextMissionChanged = true;
        }
      }
    }
  }

  // 7. Completed Tasks Diff
  const completedTasksMatches: TaskMatchResult[] = [];
  const completedTasksSummary: Array<{ title: string; matchedTaskId?: string | null }> = [];

  if (Array.isArray(data.completed_tasks)) {
    for (const ct of data.completed_tasks) {
      const match = matchTaskInProject(ct.task_id, ct.title, tasks);
      if (match.matched) {
        completedTasksMatches.push({
          providedTitle: ct.title,
          providedTaskId: ct.task_id,
          matchedTask: match.matched,
          isAmbiguous: false,
          action: 'complete',
          fieldChanges: {
            status: { from: match.matched.status, to: 'Concluída' },
          },
        });
        completedTasksSummary.push({
          title: match.matched.title,
          matchedTaskId: match.matched.id,
        });
      } else {
        completedTasksMatches.push({
          providedTitle: ct.title,
          providedTaskId: ct.task_id,
          isAmbiguous: match.isAmbiguous,
          ambiguousCandidates: match.candidates,
          action: 'create',
          newTaskData: {
            title: ct.title || 'Tarefa Concluída',
            type: ct.type || 'Melhoria',
            priority: ct.priority || 'Média',
            status: 'concluida',
            description: ct.description || 'Concluída via atualização IA',
          },
        });
        completedTasksSummary.push({
          title: ct.title || 'Tarefa Concluída',
          matchedTaskId: null,
        });
      }
    }
  }

  // 8. Updated Tasks Diff
  const updatedTasksMatches: TaskMatchResult[] = [];
  const updatedTasksSummary: Array<{ title: string; matchedTaskId?: string | null; changes: Record<string, string> }> = [];

  if (Array.isArray(data.updated_tasks)) {
    for (const ut of data.updated_tasks) {
      const match = matchTaskInProject(ut.task_id, ut.title, tasks);
      const changesMap: Record<string, string> = {};

      if (match.matched) {
        const fieldChanges: TaskMatchResult['fieldChanges'] = {};
        if (ut.status) {
          const targetStatus = mapSchemaTaskStatus(ut.status);
          if (targetStatus !== match.matched.status) {
            fieldChanges.status = { from: match.matched.status, to: targetStatus };
            changesMap.status = targetStatus;
          }
        }
        if (ut.priority) {
          const targetPri = mapSchemaPriority(ut.priority);
          if (targetPri !== match.matched.priority) {
            fieldChanges.priority = { from: match.matched.priority, to: targetPri };
            changesMap.priority = targetPri;
          }
        }
        if (ut.type) {
          const targetType = mapSchemaTaskType(ut.type);
          if (targetType !== match.matched.type) {
            fieldChanges.type = { from: match.matched.type, to: targetType };
            changesMap.type = targetType;
          }
        }
        if (ut.description && ut.description !== match.matched.description) {
          fieldChanges.description = { from: match.matched.description, to: ut.description };
          changesMap.description = ut.description;
        }

        updatedTasksMatches.push({
          providedTitle: ut.title,
          providedTaskId: ut.task_id,
          matchedTask: match.matched,
          action: 'update',
          fieldChanges,
        });

        updatedTasksSummary.push({
          title: match.matched.title,
          matchedTaskId: match.matched.id,
          changes: changesMap,
        });
      }
    }
  }

  // 9. New Tasks to create
  const newTasksToCreate = Array.isArray(data.new_tasks) ? data.new_tasks : [];
  const issuesToCreate = Array.isArray(data.issues) ? data.issues : [];

  // 10. Environment Changes Diff
  const environmentChanges: ProjectUpdateDiff['environmentChanges'] = [];
  if (Array.isArray(data.environment_changes)) {
    for (const ec of data.environment_changes) {
      let matchedEnv: Environment | undefined = undefined;
      if (ec.environment_id) {
        matchedEnv = environments.find(
          (e) =>
            e.id.toLowerCase() === ec.environment_id!.toLowerCase() ||
            (e.identifier && e.identifier.toLowerCase() === ec.environment_id!.toLowerCase())
        );
      }
      if (!matchedEnv && ec.service) {
        matchedEnv = environments.find(
          (e) => normalizeString(e.name) === normalizeString(ec.service!) || normalizeString(e.service) === normalizeString(ec.service!)
        );
      }
      environmentChanges.push({
        envId: ec.environment_id,
        matchedEnv,
        service: ec.service,
        environment: ec.environment,
        change: ec.change,
        result: ec.result,
        isAmbiguous: false,
      });
    }
  }

  // 11. Known State Diff
  let knownStateDiff: ProjectUpdateDiff['knownState'] = null;
  if (data.known_state) {
    const cur = project.statePhoto || {
      working: [],
      partiallyWorking: [],
      notWorking: [],
      untested: [],
      outOfScope: [],
    };
    const working = data.known_state.working || cur.working || [];
    const partiallyWorking = data.known_state.partially_working || cur.partiallyWorking || [];
    const notWorking = data.known_state.not_working || cur.notWorking || [];
    const untested = data.known_state.not_tested || cur.untested || [];
    const outOfScope = data.known_state.out_of_scope || cur.outOfScope || [];

    knownStateDiff = {
      working,
      partiallyWorking,
      notWorking,
      untested,
      outOfScope,
      hasChanges: true,
    };
  }

  return {
    projectId: project.id,
    projectName: project.name,
    projectIdentifier: project.identifier,
    schemaVersion: data.schema_version || '1.0',
    updateType: data.update_type || 'project_update',
    health: { current: project.health, new: newHealth, changed: healthChanged },
    status: { current: project.status, new: newStatus, changed: statusChanged },
    phase: { current: project.phase, new: newPhase, changed: phaseChanged },
    progress: { current: project.progress, new: newProgress, changed: progressChanged },
    objective: { current: project.objective, new: newObjective, changed: objectiveChanged },
    nextMission: {
      currentTitle: currentMissionTitle,
      currentTaskId: project.nextTaskId,
      newTitle: nextMissionTitle,
      newTaskId: nextMissionTaskId,
      new: nextMissionTitle, // UI alias
      whyImportant: data.next_action?.reason || data.next_action?.description,
      recommendedTool: data.next_action?.recommended_tool,
      changed: nextMissionChanged,
      resolutionSource: nextMissionResolutionSource,
    },
    completedTasksMatches,
    completedTasks: completedTasksSummary,
    updatedTasksMatches,
    updatedTasks: updatedTasksSummary,
    newTasksToCreate,
    newTasks: newTasksToCreate,
    issuesToCreate,
    issues: issuesToCreate,
    resolvedIssues: data.resolved_issues || [],
    decisions: data.decisions || [],
    technicalChanges: data.technical_changes || [],
    environmentChanges,
    repository: data.repository,
    commit: data.repository?.commit
      ? { hash: data.repository.commit, message: data.repository.commit_message || undefined }
      : null,
    deployment: data.deployment,
    deploy: data.deployment,
    knownState: knownStateDiff,
    contextSummary: data.context_summary,
    sessionData: data.session,
    recommendedFollowUp: data.recommended_follow_up,
    rawJsonString,
    hasRemovedSecrets,
    parsedData: data,
  };
}

/**
 * Applies the verified PATCH to the project and related entities
 */
export function applyProjectUpdatePatch(
  project: Project,
  tasks: Task[],
  environments: Environment[],
  currentUser: UserProfile | null,
  parsedData: ProjectUpdateSchema1,
  diff: ProjectUpdateDiff,
  rawJsonString?: string
): {
  updatedProject: Project;
  updatedTasks: Task[];
  updatedEnvironments: Environment[];
  newProjectUpdate: ProjectUpdate;
  historyEvents: Array<Omit<HistoryEvent, 'id' | 'timestamp' | 'user'>>;
  newSession?: Session;
} {
  const now = new Date().toISOString();
  const operatorName = currentUser?.name || 'Operador Codex Martis';
  const historyEvents: Array<Omit<HistoryEvent, 'id' | 'timestamp' | 'user'>> = [];

  let currentTasks = [...tasks];
  let currentEnvironments = [...environments];

  // 1. Process Completed Tasks
  for (const match of diff.completedTasksMatches) {
    if (match.matchedTask) {
      const taskId = match.matchedTask.id;
      currentTasks = currentTasks.map((t) =>
        t.id === taskId ? { ...t, status: 'Concluída' as TaskStatus, updatedAt: now } : t
      );

      historyEvents.push({
        type: 'TASK_COMPLETED',
        category: 'TAREFA',
        projectId: project.id,
        projectName: project.name,
        title: 'TAREFA CONCLUÍDA VIA ATUALIZAÇÃO IA',
        description: `Tarefa "${match.matchedTask.title}" marcada como concluída conforme atualização técnica.`,
      });
    } else if (match.action === 'create' && match.newTaskData) {
      // Create already-completed task
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const rawData = match.newTaskData as any;
      const newTask: Task = {
        id: newTaskId,
        projectId: project.id,
        projectName: project.name,
        title: rawData.title,
        description: rawData.description || '',
        type: mapSchemaTaskType(rawData.type),
        priority: mapSchemaPriority(rawData.priority || rawData.severity),
        status: 'Concluída',
        assignedTo: operatorName,
        isNextMission: false,
        createdAt: now,
        updatedAt: now,
      };
      currentTasks = [newTask, ...currentTasks];

      historyEvents.push({
        type: 'TASK_COMPLETED',
        category: 'TAREFA',
        projectId: project.id,
        projectName: project.name,
        title: 'TAREFA REGISTRADA COMO CONCLUÍDA',
        description: `Tarefa "${newTask.title}" registrada diretamente como concluída pela atualização.`,
      });
    }
  }

  // 2. Process Updated Tasks
  for (const match of diff.updatedTasksMatches) {
    if (match.matchedTask && match.fieldChanges) {
      const taskId = match.matchedTask.id;
      const updates: Partial<Task> = { updatedAt: now };

      if (match.fieldChanges.status) updates.status = match.fieldChanges.status.to;
      if (match.fieldChanges.priority) updates.priority = match.fieldChanges.priority.to;
      if (match.fieldChanges.type) updates.type = match.fieldChanges.type.to;
      if (match.fieldChanges.description) updates.description = match.fieldChanges.description.to;

      currentTasks = currentTasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));

      historyEvents.push({
        type: 'TASK_UPDATED',
        category: 'TAREFA',
        projectId: project.id,
        projectName: project.name,
        title: 'TAREFA ATUALIZADA VIA ATUALIZAÇÃO IA',
        description: `Tarefa "${match.matchedTask.title}" atualizada com novos parâmetros técnicos.`,
      });
    }
  }

  // 3. Process New Tasks
  const createdNewTasks: Task[] = [];
  for (const nt of diff.newTasksToCreate) {
    const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newTask: Task = {
      id: newTaskId,
      projectId: project.id,
      projectName: project.name,
      title: nt.title,
      description: nt.description || '',
      type: mapSchemaTaskType(nt.type),
      priority: mapSchemaPriority(nt.priority),
      status: mapSchemaTaskStatus(nt.status),
      assignedTo: operatorName,
      isNextMission: false,
      createdAt: now,
      updatedAt: now,
    };
    createdNewTasks.push(newTask);

    historyEvents.push({
      type: 'TASK_CREATED',
      category: 'TAREFA',
      projectId: project.id,
      projectName: project.name,
      title: 'NOVA TAREFA IDENTIFICADA PELA IA',
      description: `Nova tarefa "${newTask.title}" (${newTask.type} / Prioridade ${newTask.priority}) adicionada ao backlog.`,
    });
  }

  // 4. Process Issues (Converted to Tasks with type "Auditoria")
  for (const is of diff.issuesToCreate) {
    const issueTaskId = `task-issue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const descWithEvidence = [
      is.description || '',
      is.evidence ? `Evidência técnica: ${is.evidence}` : '',
      is.status ? `Status informado: ${is.status}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const issueTask: Task = {
      id: issueTaskId,
      projectId: project.id,
      projectName: project.name,
      title: `[Problema] ${is.title}`,
      description: descWithEvidence,
      type: 'Auditoria',
      priority: mapSchemaPriority(is.severity),
      status: is.status === 'resolvido' ? 'Concluída' : 'Pendente',
      assignedTo: operatorName,
      isNextMission: false,
      createdAt: now,
      updatedAt: now,
    };
    createdNewTasks.push(issueTask);

    historyEvents.push({
      type: 'TASK_CREATED',
      category: 'AUDITORIA',
      projectId: project.id,
      projectName: project.name,
      title: 'PROBLEMA REGISTRADO COMO TAREFA',
      description: `Problema "${is.title}" (Severidade: ${is.severity || 'Média'}) convertido em tarefa de auditoria.`,
    });
  }

  currentTasks = [...createdNewTasks, ...currentTasks];

  // 5. Process Resolved Issues
  for (const resIs of diff.resolvedIssues) {
    historyEvents.push({
      type: 'ISSUE_RESOLVED',
      category: 'CORRECAO',
      projectId: project.id,
      projectName: project.name,
      title: 'PROBLEMA MARCADO COMO RESOLVIDO',
      description: `Problema "${resIs.title}" resolvido: ${resIs.resolution || 'Correção confirmada'} | Validação: ${resIs.validation || 'Sim'}.`,
    });

    const matchingTask = matchTaskInProject(null, resIs.title, currentTasks);
    if (matchingTask.matched && matchingTask.matched.status !== 'Concluída') {
      currentTasks = currentTasks.map((t) =>
        t.id === matchingTask.matched!.id ? { ...t, status: 'Concluída', updatedAt: now } : t
      );
    }
  }

  // 6. Process Decisions
  for (const dec of diff.decisions) {
    historyEvents.push({
      type: 'DECISION_RECORDED',
      category: 'CONFIGURACAO',
      projectId: project.id,
      projectName: project.name,
      title: `DECISÃO: ${dec.title}`,
      description: `Decisão: ${dec.decision || dec.title} | Motivo: ${dec.reason || 'N/A'} | Impacto: ${dec.impact || 'N/A'}`,
    });
  }

  // 7. Process Commit & Deploy
  if (diff.repository?.commit) {
    historyEvents.push({
      type: 'COMMIT_RECORDED',
      category: 'PROJETO',
      projectId: project.id,
      projectName: project.name,
      title: 'COMMIT INFORMADO VIA ATUALIZAÇÃO IA',
      description: `Commit ${diff.repository.commit} (${diff.repository.branch || 'main'}): "${diff.repository.commit_message || 'Sem mensagem'}" [Origem: ai_project_update].`,
      commitHash: diff.repository.commit,
    });
  }

  if (diff.deployment?.performed) {
    historyEvents.push({
      type: 'DEPLOY_RECORDED',
      category: 'DEPLOY',
      projectId: project.id,
      projectName: project.name,
      title: 'DEPLOY INFORMADO PELA ATUALIZAÇÃO',
      description: `Deploy registrado em ${diff.deployment.environment || 'Produção'} (${diff.deployment.platform || 'Cloud'}): ${diff.deployment.url || 'URL não informada'} - Status: ${diff.deployment.status || 'Informado com sucesso'}.`,
    });
  }

  // 8. Process Environment Changes
  for (const ec of diff.environmentChanges) {
    if (ec.matchedEnv && ec.change) {
      const envId = ec.matchedEnv.id;
      currentEnvironments = currentEnvironments.map((e) =>
        e.id === envId
          ? {
              ...e,
              observations: [e.observations, `Atualização IA (${now.slice(0, 10)}): ${ec.change}`]
                .filter(Boolean)
                .join(' | '),
              updatedAt: now,
            }
          : e
      );

      historyEvents.push({
        type: 'ENVIRONMENT_UPDATED',
        category: 'AMBIENTE',
        projectId: project.id,
        projectName: project.name,
        title: 'AMBIENTE ATUALIZADO VIA IA',
        description: `Ambiente "${ec.matchedEnv.name}" atualizado: ${ec.change} (${ec.result || 'OK'}).`,
      });
    }
  }

  // 9. Resolve and set Next Mission as single source of truth
  let finalNextTaskId: string | null = project.nextTaskId;
  let finalNextTaskTitle: string | undefined = project.nextTaskTitle;

  const candidateMissionTitle = diff.nextMission.newTitle || diff.nextMission.new;

  if (diff.nextMission.changed && candidateMissionTitle) {
    if (diff.nextMission.newTaskId) {
      finalNextTaskId = diff.nextMission.newTaskId;
      finalNextTaskTitle = candidateMissionTitle;
    } else {
      const match = matchTaskInProject(null, candidateMissionTitle, currentTasks);
      if (match.matched) {
        finalNextTaskId = match.matched.id;
        finalNextTaskTitle = match.matched.title;
      } else {
        const nextTaskId = `task-mission-${Date.now()}`;
        const missionTask: Task = {
          id: nextTaskId,
          projectId: project.id,
          projectName: project.name,
          title: candidateMissionTitle,
          description: diff.nextMission.whyImportant || 'Definida como próxima missão via IA',
          type: 'Feature',
          priority: 'Alta',
          status: 'Pendente',
          assignedTo: operatorName,
          isNextMission: true,
          createdAt: now,
          updatedAt: now,
        };
        currentTasks = [missionTask, ...currentTasks];
        finalNextTaskId = nextTaskId;
        finalNextTaskTitle = missionTask.title;
      }
    }

    // Set isNextMission flag on the matching task
    currentTasks = currentTasks.map((t) => ({
      ...t,
      isNextMission: t.id === finalNextTaskId,
    }));

    historyEvents.push({
      type: 'NEXT_MISSION_CHANGED',
      category: 'PROJETO',
      projectId: project.id,
      projectName: project.name,
      title: 'PRÓXIMA MISSÃO ATUALIZADA',
      description: `Nova missão prioritária definida: "${finalNextTaskTitle}".`,
    });
  }

  // 10. Update Project fields (PATCH rules: update whenever valid new value provided)
  const updatedProject: Project = {
    ...project,
    health: diff.health.new || project.health,
    status: diff.status.new || project.status,
    phase: diff.phase.new || project.phase,
    progress: typeof diff.progress.new === 'number' && !isNaN(diff.progress.new) ? diff.progress.new : project.progress,
    objective: diff.objective.new || project.objective,
    nextTaskId: finalNextTaskId,
    nextTaskTitle: finalNextTaskTitle || project.nextTaskTitle,
    nextTaskWhyImportant: diff.nextMission.whyImportant || project.nextTaskWhyImportant,
    recommendedTool: diff.nextMission.recommendedTool || project.recommendedTool,
    lastCommit: diff.repository?.commit || project.lastCommit,
    contextSummary: diff.contextSummary || project.contextSummary,
    statePhoto: diff.knownState
      ? {
          working: diff.knownState.working,
          partiallyWorking: diff.knownState.partiallyWorking,
          notWorking: diff.knownState.notWorking,
          untested: diff.knownState.untested,
          outOfScope: diff.knownState.outOfScope,
        }
      : project.statePhoto,
    updatedAt: now,
  };

  // 11. Create Session entity if session data is present
  let newSession: Session | undefined;
  const effectiveSession = parsedData.session || diff.sessionData;
  if (effectiveSession && (effectiveSession.summary || effectiveSession.work_performed?.length)) {
    const sessNum = (project as any).sessionCount ? (project as any).sessionCount + 1 : Math.floor(Math.random() * 80) + 10;
    newSession = {
      id: `sess-update-${Date.now()}`,
      sessionNumber: sessNum,
      projectId: project.id,
      projectName: project.name,
      taskId: finalNextTaskId || undefined,
      taskTitle: finalNextTaskTitle,
      objective: effectiveSession.summary || 'Sessão de atualização registrada via IA',
      startedAt: now,
      endedAt: now,
      durationMinutes: 45,
      status: 'encerrada',
      workDone: (effectiveSession.work_performed || []).join('\n') || effectiveSession.summary || undefined,
      result: effectiveSession.result || 'sucesso',
      testsDone: (effectiveSession.tests_performed || []).join('\n') || effectiveSession.tests_result || undefined,
      commitHash: diff.repository?.commit || undefined,
      commitMessage: diff.repository?.commit_message || undefined,
      deployDone: Boolean(diff.deployment?.performed),
      decisions: diff.decisions.map((d) => `${d.title}: ${d.decision || ''}`),
      newNextMission: finalNextTaskTitle,
    };
  }

  // 12. Create ProjectUpdate Record
  const finalRawJson = rawJsonString || diff.rawJsonString || JSON.stringify(parsedData, null, 2);
  const newProjectUpdate: ProjectUpdate = {
    id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId: project.id,
    projectName: project.name,
    schemaVersion: diff.schemaVersion || '1.0',
    updateType: 'project_update',
    originalJson: finalRawJson,
    rawJson: finalRawJson,
    parsedData,
    appliedDiff: diff,
    source: 'ai_project_update',
    createdAt: now,
    appliedAt: now,
    summary:
      parsedData.session?.summary ||
      `Atualização técnica aplicada: Saúde: ${updatedProject.health}, Progresso: ${updatedProject.progress}%.`,
  };

  // Primary History Event
  historyEvents.unshift({
    type: 'PROJECT_UPDATE_IMPORTED',
    category: 'AUDITORIA',
    projectId: project.id,
    projectName: project.name,
    title: 'ATUALIZAÇÃO DE PROJETO APLICADA (SCHEMA 1.0)',
    description: `Atualização técnica processada com sucesso: ${diff.completedTasksMatches.length} tarefas concluídas, ${diff.newTasksToCreate.length} tarefas novas, ${diff.decisions.length} decisões registradas.`,
    commitHash: diff.repository?.commit || undefined,
  });

  return {
    updatedProject,
    updatedTasks: currentTasks,
    updatedEnvironments: currentEnvironments,
    newProjectUpdate,
    historyEvents,
    newSession,
  };
}

/**
 * Builds the real context snapshot of a project for inclusion in the Prompt
 */
export function generateProjectUpdateContextSnapshot(
  project: Project,
  tasks: Task[],
  sessions: Session[],
  environments: Environment[],
  history: HistoryEvent[],
  lastUpdate?: ProjectUpdate
): string {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const openTasks = projectTasks.filter((t) => t.status === 'Pendente');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'Em andamento');
  const unvalidatedTasks = projectTasks.filter((t) => t.status === 'Executada não validada');
  const completedTasks = projectTasks.filter((t) => t.status === 'Concluída');

  const projectEnvironments = environments.filter((e) => e.projectId === project.id);
  const projectSessions = sessions.filter((s) => s.projectId === project.id);
  const projectHistory = history.filter((h) => h.projectId === project.id).slice(0, 5);

  const nextMissionTask = project.nextTaskId
    ? projectTasks.find((t) => t.id === project.nextTaskId)
    : null;
  const nextMissionTitle = nextMissionTask
    ? nextMissionTask.title
    : project.nextTaskTitle || 'Nenhuma missão definida';

  const knownState = project.statePhoto || {
    working: [],
    partiallyWorking: [],
    notWorking: [],
    untested: [],
    outOfScope: [],
  };

  const lines: string[] = [
    '==================================================',
    'FOTOGRAFIA TÉCNICA ATUAL DO PROJETO [CODEX MARTIS]',
    '==================================================',
    `Projeto: ${project.name}`,
    `Identifier: ${project.identifier}`,
    `ID: ${project.id}`,
    `Descrição: ${project.description || 'Não informada'}`,
    `Tipo: ${project.type || 'Sistema'}`,
    `Status: ${project.status}`,
    `Saúde: ${project.health}`,
    `Fase Atual: ${project.phase}`,
    `Progresso Atual: ${project.progress}%`,
    `Objetivo Atual: ${project.objective || 'Não informado'}`,
    '',
    '--- PRÓXIMA MISSÃO PRINCIPAL ---',
    `Próxima Missão: ${nextMissionTitle}`,
    `Next Task ID: ${project.nextTaskId || 'N/A'}`,
    `Por que é importante: ${project.nextTaskWhyImportant || 'N/A'}`,
    `Ferramenta Recomendada: ${project.recommendedTool || 'Google AI Studio'}`,
    '',
    `--- TAREFAS EM ANDAMENTO (${inProgressTasks.length}) ---`,
    inProgressTasks.length > 0
      ? inProgressTasks
          .map((t) => `- [ID: ${t.id}] [${t.priority}] (${t.type}) ${t.title}`)
          .join('\n')
      : '- Nenhuma tarefa em andamento.',
    '',
    `--- TAREFAS EXECUTADAS NÃO VALIDADAS (${unvalidatedTasks.length}) ---`,
    unvalidatedTasks.length > 0
      ? unvalidatedTasks
          .map((t) => `- [ID: ${t.id}] [${t.priority}] (${t.type}) ${t.title}`)
          .join('\n')
      : '- Nenhuma tarefa executada aguardando validação.',
    '',
    `--- TAREFAS ABERTAS / PENDENTES (${openTasks.length}) ---`,
    openTasks.length > 0
      ? openTasks
          .slice(0, 10)
          .map((t) => `- [ID: ${t.id}] [${t.priority}] (${t.type}) ${t.title}`)
          .join('\n')
      : '- Nenhuma tarefa pendente.',
    '',
    `--- TAREFAS CONCLUÍDAS RECENTES (${completedTasks.length}) ---`,
    completedTasks.length > 0
      ? completedTasks
          .slice(0, 5)
          .map((t) => `- [ID: ${t.id}] ${t.title}`)
          .join('\n')
      : '- Nenhuma tarefa concluída recentemente.',
    '',
    '--- ESTADO FUNCIONAL CONHECIDO (KNOWN STATE) ---',
    `Funcionando: ${knownState.working?.length ? knownState.working.join(', ') : 'Nenhum item confirmado'}`,
    `Parcialmente Funcionando: ${knownState.partiallyWorking?.length ? knownState.partiallyWorking.join(', ') : 'Nenhum'}`,
    `Não Funcionando: ${knownState.notWorking?.length ? knownState.notWorking.join(', ') : 'Nenhum erro crítico registrado'}`,
    `Não Testado: ${knownState.untested?.length ? knownState.untested.join(', ') : 'Nenhum'}`,
    `Fora de Escopo: ${knownState.outOfScope?.length ? knownState.outOfScope.join(', ') : 'Nenhum'}`,
    '',
    `--- AMBIENTES CADASTRADOS (${projectEnvironments.length}) ---`,
    projectEnvironments.length > 0
      ? projectEnvironments
          .map(
            (e) =>
              `- [ID: ${e.id}] ${e.name} (${e.service} / ${e.category}) - Status: ${e.status} | URL: ${e.url || 'N/A'}`
          )
          .join('\n')
      : '- Nenhum ambiente cadastrado.',
    '',
    '--- REPOSITÓRIO E VERSÃO ---',
    `Repositório: ${project.repositoryInfo?.name || project.name}`,
    `Branch: ${project.repositoryInfo?.default_branch || 'main'}`,
    `Último Commit Registrado: ${project.lastCommit || 'Nenhum'}`,
    '',
    `--- SESSÕES ANTERIORES (${projectSessions.length}) ---`,
    projectSessions.length > 0
      ? projectSessions
          .slice(0, 3)
          .map(
            (s) =>
              `- Sessão #${s.sessionNumber.toString().padStart(3, '0')} (${s.startedAt.slice(0, 10)}): ${s.objective} -> Resultado: ${s.result || 'Concluída'}`
          )
          .join('\n')
      : '- Nenhuma sessão anterior registrada.',
    '',
    '--- HISTÓRICO RECENTE ---',
    projectHistory.length > 0
      ? projectHistory.map((h) => `- [${h.timestamp}] ${h.title}: ${h.description || h.details || ''}`).join('\n')
      : '- Sem histórico recente.',
  ];

  if (lastUpdate) {
    lines.push(
      '',
      '--- ÚLTIMO PROJECT UPDATE ---',
      `ID: ${lastUpdate.id} em ${lastUpdate.appliedAt.slice(0, 16)}`,
      `Resumo: ${lastUpdate.summary || 'N/A'}`
    );
  }

  if (project.contextSummary) {
    lines.push(
      '',
      '--- CONTEXT SUMMARY ATUAL ---',
      project.contextSummary
    );
  }

  lines.push('==================================================\n');

  return lines.join('\n');
}

/**
 * Generates the complete prompt (Standard prompt + Context)
 */
export function generateCompleteUpdatePrompt(
  project: Project,
  tasks: Task[],
  sessions: Session[],
  environments: Environment[],
  history: HistoryEvent[],
  lastUpdate?: ProjectUpdate,
  baseTemplate: string = DEFAULT_PROJECT_UPDATE_PROMPT
): string {
  const contextSnapshot = generateProjectUpdateContextSnapshot(
    project,
    tasks,
    sessions,
    environments,
    history,
    lastUpdate
  );

  return `${contextSnapshot}\n\n${baseTemplate}`;
}
