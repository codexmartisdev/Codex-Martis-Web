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
    whyImportant?: string | null;
    recommendedTool?: string | null;
    changed: boolean;
    resolutionSource: 'task_id' | 'existing_task_match' | 'new_task_match' | 'created_new_task' | 'unchanged';
  };

  // Task Operations
  completedTasksMatches: TaskMatchResult[];
  updatedTasksMatches: TaskMatchResult[];
  newTasksToCreate: ProjectUpdateSchemaNewTask[];
  issuesToCreate: ProjectUpdateSchemaIssue[];
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
  deployment?: ProjectUpdateSchemaDeployment | null;

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

  // Metadata
  rawJsonString: string;
  hasRemovedSecrets?: boolean;
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

// Valid Enums
const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  'planejamento',
  'desenvolvimento',
  'teste',
  'producao',
  'pausado',
  'encerrado',
];

const VALID_PROJECT_HEALTHS: ProjectHealth[] = [
  'saudavel',
  'atencao',
  'bloqueado',
  'nao_avaliado',
];

const VALID_SESSION_RESULTS = [
  'sucesso',
  'sucesso_parcial',
  'sem_alteracoes',
  'falha',
  'indeterminado',
];

const VALID_TASK_STATUSES = [
  'pendente',
  'em_andamento',
  'executada_nao_validada',
  'concluida',
  'cancelada',
];

const VALID_TASK_TYPES = [
  'bug',
  'melhoria',
  'feature',
  'auditoria',
  'infraestrutura',
  'teste',
  'documentacao',
  'ideia',
  'outro',
];

const VALID_PRIORITIES = ['critica', 'alta', 'media', 'baixa'];

const VALID_ISSUE_STATUSES = [
  'aberto',
  'em_correcao',
  'corrigido_nao_validado',
  'resolvido',
  'aceito',
  'descartado',
];

/**
 * Maps schema task status to Codex Martis TaskStatus
 */
export function mapSchemaTaskStatus(status?: string | null): TaskStatus {
  if (!status) return 'Pendente';
  const s = status.toLowerCase().trim().replace(/ /g, '_');
  switch (s) {
    case 'concluida':
    case 'concluída':
      return 'Concluída';
    case 'em_andamento':
    case 'em andamento':
      return 'Em andamento';
    case 'executada_nao_validada':
    case 'executada não validada':
      return 'Executada não validada';
    case 'cancelada':
      return 'Cancelada';
    case 'pendente':
    default:
      return 'Pendente';
  }
}

/**
 * Maps schema task type to Codex Martis TaskType
 */
export function mapSchemaTaskType(type?: string | null): TaskType {
  if (!type) return 'Melhoria';
  const t = type.toLowerCase().trim();
  switch (t) {
    case 'bug':
      return 'Bug';
    case 'feature':
      return 'Feature';
    case 'auditoria':
      return 'Auditoria';
    case 'infraestrutura':
      return 'Infraestrutura';
    case 'teste':
      return 'Teste';
    case 'documentacao':
    case 'documentação':
      return 'Documentação';
    case 'ideia':
      return 'Ideia';
    case 'outro':
      return 'Outro';
    case 'melhoria':
    default:
      return 'Melhoria';
  }
}

/**
 * Maps schema priority / severity to Codex Martis TaskPriority
 */
export function mapSchemaPriority(p?: string | null): TaskPriority {
  if (!p) return 'Média';
  const norm = p.toLowerCase().trim();
  switch (norm) {
    case 'critica':
    case 'crítica':
      return 'Crítica';
    case 'alta':
      return 'Alta';
    case 'baixa':
      return 'Baixa';
    case 'media':
    case 'média':
    default:
      return 'Média';
  }
}

/**
 * Normalized string matching helper
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Task matching algorithm:
 * 1. task_id exact match
 * 2. exact title
 * 3. normalized title
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

    // Check for schema_version
    if (!parsedRaw.schema_version) {
      return { success: false, error: 'Schema incompatível: O campo "schema_version" é obrigatório.' };
    }

    if (parsedRaw.schema_version !== '1.0') {
      return {
        success: false,
        error: `Schema incompatível: Versão "${parsedRaw.schema_version}" não suportada. Esperado: "1.0".`,
      };
    }

    // Check update_type
    if (parsedRaw.update_type && parsedRaw.update_type !== 'project_update') {
      if (parsedRaw.update_type === 'project_creation' || parsedRaw.import_type === 'project_creation') {
        return {
          success: false,
          error: 'Este JSON pertence ao fluxo de criação inicial de projeto (Project Import), não ao de atualização (Project Update).',
        };
      }
      return {
        success: false,
        error: 'Este JSON não é um Project Update. O campo "update_type" deve ser "project_update".',
      };
    }

    // Sanitize any secrets
    const { sanitized, removedCount } = sanitizeSecrets(parsedRaw);
    const parsedData: ProjectUpdateSchema1 = sanitized;

    // Check project identifier matching if supplied
    if (parsedData.project?.identifier) {
      const pIdent = parsedData.project.identifier.trim().toLowerCase();
      const curIdent = (currentProject.identifier || '').trim().toLowerCase();
      const curId = currentProject.id.trim().toLowerCase();

      if (pIdent && pIdent !== curIdent && pIdent !== curId) {
        return {
          success: false,
          error: `O identificador informado ("${parsedData.project.identifier}") não corresponde ao projeto atual ("${currentProject.name}" - ${currentProject.identifier}).`,
        };
      }
    }

    // Validate Enums if supplied
    if (parsedData.project?.project_status) {
      const st = parsedData.project.project_status.toLowerCase().trim();
      if (!VALID_PROJECT_STATUSES.includes(st as any)) {
        return {
          success: false,
          error: `Valor inválido para project_status: "${parsedData.project.project_status}". Valores permitidos: ${VALID_PROJECT_STATUSES.join(', ')}.`,
        };
      }
    }

    if (parsedData.project?.project_health) {
      const hl = parsedData.project.project_health.toLowerCase().trim();
      if (!VALID_PROJECT_HEALTHS.includes(hl as any)) {
        return {
          success: false,
          error: `Valor inválido para project_health: "${parsedData.project.project_health}". Valores permitidos: ${VALID_PROJECT_HEALTHS.join(', ')}.`,
        };
      }
    }

    if (parsedData.session?.result) {
      const sr = parsedData.session.result.toLowerCase().trim();
      if (!VALID_SESSION_RESULTS.includes(sr)) {
        return {
          success: false,
          error: `Valor inválido para session.result: "${parsedData.session.result}". Valores permitidos: ${VALID_SESSION_RESULTS.join(', ')}.`,
        };
      }
    }

    // Validate progress range if supplied
    if (parsedData.project?.progress !== undefined && parsedData.project?.progress !== null) {
      const prog = Number(parsedData.project.progress);
      if (isNaN(prog) || prog < 0 || prog > 100) {
        return {
          success: false,
          error: 'Valor inválido para progress: deve ser um número entre 0 e 100.',
        };
      }
    }

    // Validate tasks enums
    if (Array.isArray(parsedData.updated_tasks)) {
      for (const ut of parsedData.updated_tasks) {
        if (ut.status && !VALID_TASK_STATUSES.includes(ut.status.toLowerCase().replace(/ /g, '_'))) {
          return {
            success: false,
            error: `Valor inválido para task.status em updated_tasks: "${ut.status}".`,
          };
        }
        if (ut.type && !VALID_TASK_TYPES.includes(ut.type.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para task.type em updated_tasks: "${ut.type}".`,
          };
        }
        if (ut.priority && !VALID_PRIORITIES.includes(ut.priority.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para priority em updated_tasks: "${ut.priority}".`,
          };
        }
      }
    }

    if (Array.isArray(parsedData.new_tasks)) {
      for (const nt of parsedData.new_tasks) {
        if (!nt.title || !nt.title.trim()) {
          return {
            success: false,
            error: 'Cada item em new_tasks deve conter obrigatoriamente um "title".',
          };
        }
        if (nt.type && !VALID_TASK_TYPES.includes(nt.type.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para task.type em new_tasks: "${nt.type}".`,
          };
        }
        if (nt.priority && !VALID_PRIORITIES.includes(nt.priority.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para priority em new_tasks: "${nt.priority}".`,
          };
        }
      }
    }

    if (Array.isArray(parsedData.issues)) {
      for (const is of parsedData.issues) {
        if (!is.title || !is.title.trim()) {
          return {
            success: false,
            error: 'Cada item em issues deve conter obrigatoriamente um "title".',
          };
        }
        if (is.severity && !VALID_PRIORITIES.includes(is.severity.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para severity em issues: "${is.severity}".`,
          };
        }
        if (is.status && !VALID_ISSUE_STATUSES.includes(is.status.toLowerCase())) {
          return {
            success: false,
            error: `Valor inválido para status em issues: "${is.status}".`,
          };
        }
      }
    }

    // Build comprehensive Diff object for preview without applying any changes
    const diff = buildProjectUpdateDiff(
      currentProject,
      projectTasks,
      projectEnvironments,
      parsedData,
      clean,
      removedCount > 0
    );

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
    ? (data.project.project_health.toLowerCase() as ProjectHealth)
    : project.health;
  const healthChanged = Boolean(data.project?.project_health && newHealth !== project.health);

  // 2. Status Diff
  const newStatus = data.project?.project_status
    ? (data.project.project_status.toLowerCase() as ProjectStatus)
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
  let currentMissionTask = project.nextTaskId
    ? tasks.find((t) => t.id === project.nextTaskId)
    : null;
  const currentMissionTitle = currentMissionTask
    ? currentMissionTask.title
    : project.nextTaskTitle || 'Nenhuma missão definida';

  let nextMissionTitle = currentMissionTitle;
  let nextMissionTaskId = project.nextTaskId;
  let nextMissionChanged = false;
  let nextMissionResolutionSource: ProjectUpdateDiff['nextMission']['resolutionSource'] = 'unchanged';

  const na = data.next_action;
  if (na && typeof na.title === 'string' && na.title.trim()) {
    const naTitle = na.title.trim();
    nextMissionTitle = naTitle;
    nextMissionChanged = nextMissionTitle !== currentMissionTitle;

    // Resolve target task in order:
    // 1. next_action.task_id
    if (na.task_id) {
      const byId = tasks.find((t) => t.id === na.task_id);
      if (byId) {
        nextMissionTaskId = byId.id;
        nextMissionResolutionSource = 'task_id';
      }
    }

    // 2. Task with matching title
    if (!nextMissionTaskId || nextMissionResolutionSource === 'unchanged') {
      const match = matchTaskInProject(null, naTitle, tasks);
      if (match.matched) {
        nextMissionTaskId = match.matched.id;
        nextMissionResolutionSource = 'existing_task_match';
      }
    }

    // 3. Match in new_tasks list
    if (nextMissionResolutionSource === 'unchanged' && Array.isArray(data.new_tasks)) {
      const foundInNew = data.new_tasks.find(
        (nt) => normalizeString(nt.title) === normalizeString(naTitle)
      );
      if (foundInNew) {
        nextMissionResolutionSource = 'new_task_match';
      }
    }

    // 4. Fallback create new task
    if (nextMissionResolutionSource === 'unchanged' && nextMissionChanged) {
      nextMissionResolutionSource = 'created_new_task';
    }
  }

  // 7. Completed Tasks Matching
  const completedTasksMatches: TaskMatchResult[] = [];
  if (Array.isArray(data.completed_tasks)) {
    for (const ct of data.completed_tasks) {
      const match = matchTaskInProject(ct.task_id, ct.title, tasks);
      completedTasksMatches.push({
        providedTitle: ct.title,
        providedTaskId: ct.task_id,
        matchedTask: match.matched,
        isAmbiguous: match.isAmbiguous,
        ambiguousCandidates: match.candidates,
        action: match.matched ? 'complete' : 'unmatched',
        fieldChanges: match.matched
          ? {
              status: { from: match.matched.status, to: 'Concluída' },
            }
          : undefined,
      });
    }
  }

  // 8. Updated Tasks Matching
  const updatedTasksMatches: TaskMatchResult[] = [];
  if (Array.isArray(data.updated_tasks)) {
    for (const ut of data.updated_tasks) {
      const match = matchTaskInProject(ut.task_id, ut.title, tasks);
      const fieldChanges: TaskMatchResult['fieldChanges'] = {};

      if (match.matched) {
        if (ut.status) {
          const mappedSt = mapSchemaTaskStatus(ut.status);
          if (mappedSt !== match.matched.status) {
            fieldChanges.status = { from: match.matched.status, to: mappedSt };
          }
        }
        if (ut.priority) {
          const mappedP = mapSchemaPriority(ut.priority);
          if (mappedP !== match.matched.priority) {
            fieldChanges.priority = { from: match.matched.priority, to: mappedP };
          }
        }
        if (ut.type) {
          const mappedT = mapSchemaTaskType(ut.type);
          if (mappedT !== match.matched.type) {
            fieldChanges.type = { from: match.matched.type, to: mappedT };
          }
        }
        if (ut.description && ut.description.trim() !== match.matched.description.trim()) {
          fieldChanges.description = {
            from: match.matched.description,
            to: ut.description.trim(),
          };
        }
      }

      updatedTasksMatches.push({
        providedTitle: ut.title,
        providedTaskId: ut.task_id,
        matchedTask: match.matched,
        isAmbiguous: match.isAmbiguous,
        ambiguousCandidates: match.candidates,
        action: match.matched ? 'update' : 'unmatched',
        fieldChanges,
      });
    }
  }

  // 9. New Tasks To Create (filter duplicates already present in tasks)
  const newTasksToCreate: ProjectUpdateSchemaNewTask[] = [];
  if (Array.isArray(data.new_tasks)) {
    for (const nt of data.new_tasks) {
      if (nt.title && nt.title.trim()) {
        const norm = normalizeString(nt.title);
        const exists = tasks.some((t) => normalizeString(t.title) === norm);
        if (!exists) {
          newTasksToCreate.push(nt);
        }
      }
    }
  }

  // 10. Issues to convert to tasks
  const issuesToCreate: ProjectUpdateSchemaIssue[] = [];
  if (Array.isArray(data.issues)) {
    for (const is of data.issues) {
      if (is.title && is.title.trim()) {
        issuesToCreate.push(is);
      }
    }
  }

  // 11. Environment Changes matching
  const environmentChanges: ProjectUpdateDiff['environmentChanges'] = [];
  if (Array.isArray(data.environment_changes)) {
    for (const ec of data.environment_changes) {
      let matchedEnv: Environment | undefined;
      let isAmbiguous = false;

      if (ec.environment_id) {
        matchedEnv = environments.find(
          (e) => e.id.toLowerCase() === ec.environment_id?.trim().toLowerCase()
        );
      }

      if (!matchedEnv && ec.service) {
        const serviceNorm = normalizeString(ec.service);
        const candidates = environments.filter(
          (e) => normalizeString(e.service) === serviceNorm || normalizeString(e.name) === serviceNorm
        );
        if (candidates.length === 1) {
          matchedEnv = candidates[0];
        } else if (candidates.length > 1) {
          isAmbiguous = true;
        }
      }

      environmentChanges.push({
        envId: ec.environment_id,
        matchedEnv,
        service: ec.service,
        environment: ec.environment,
        change: ec.change,
        result: ec.result,
        isAmbiguous,
      });
    }
  }

  // 12. Known State Diff
  let knownStateDiff: ProjectUpdateDiff['knownState'] = null;
  if (data.known_state) {
    const curState = project.statePhoto || {
      working: [],
      partiallyWorking: [],
      notWorking: [],
      untested: [],
      outOfScope: [],
    };
    const ks = data.known_state;
    const working = ks.working || curState.working;
    const partiallyWorking = ks.partially_working || curState.partiallyWorking;
    const notWorking = ks.not_working || curState.notWorking;
    const untested = ks.not_tested || curState.untested;
    const outOfScope = ks.out_of_scope || curState.outOfScope;

    const hasChanges =
      JSON.stringify(working) !== JSON.stringify(curState.working) ||
      JSON.stringify(partiallyWorking) !== JSON.stringify(curState.partiallyWorking) ||
      JSON.stringify(notWorking) !== JSON.stringify(curState.notWorking) ||
      JSON.stringify(untested) !== JSON.stringify(curState.untested) ||
      JSON.stringify(outOfScope) !== JSON.stringify(curState.outOfScope);

    knownStateDiff = {
      working,
      partiallyWorking,
      notWorking,
      untested,
      outOfScope,
      hasChanges,
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
      whyImportant: data.next_action?.reason || data.next_action?.description,
      recommendedTool: data.next_action?.recommended_tool,
      changed: nextMissionChanged,
      resolutionSource: nextMissionResolutionSource,
    },
    completedTasksMatches,
    updatedTasksMatches,
    newTasksToCreate,
    issuesToCreate,
    resolvedIssues: data.resolved_issues || [],
    decisions: data.decisions || [],
    technicalChanges: data.technical_changes || [],
    environmentChanges,
    repository: data.repository,
    deployment: data.deployment,
    knownState: knownStateDiff,
    contextSummary: data.context_summary,
    sessionData: data.session,
    recommendedFollowUp: data.recommended_follow_up,
    rawJsonString,
    hasRemovedSecrets,
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

    // If an existing task matches this resolved issue title, mark it as completed
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

  if (diff.nextMission.changed && diff.nextMission.newTitle) {
    if (diff.nextMission.newTaskId) {
      finalNextTaskId = diff.nextMission.newTaskId;
      finalNextTaskTitle = diff.nextMission.newTitle;
    } else {
      // Find matching task among currentTasks or createdNewTasks
      const match = matchTaskInProject(null, diff.nextMission.newTitle, currentTasks);
      if (match.matched) {
        finalNextTaskId = match.matched.id;
        finalNextTaskTitle = match.matched.title;
      } else {
        // Create new task for Next Mission
        const nextTaskId = `task-mission-${Date.now()}`;
        const missionTask: Task = {
          id: nextTaskId,
          projectId: project.id,
          projectName: project.name,
          title: diff.nextMission.newTitle,
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

  // 10. Update Project fields (PATCH rules: null/undefined = retain current value)
  const updatedProject: Project = {
    ...project,
    health: diff.health.changed ? diff.health.new : project.health,
    status: diff.status.changed ? diff.status.new : project.status,
    phase: diff.phase.changed ? diff.phase.new : project.phase,
    progress: diff.progress.changed ? diff.progress.new : project.progress,
    objective: diff.objective.changed ? diff.objective.new : project.objective,
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
  if (parsedData.session && (parsedData.session.summary || parsedData.session.work_performed?.length)) {
    const sessNum = (project as any).sessionCount ? (project as any).sessionCount + 1 : Math.floor(Math.random() * 80) + 10;
    newSession = {
      id: `sess-update-${Date.now()}`,
      sessionNumber: sessNum,
      projectId: project.id,
      projectName: project.name,
      taskId: finalNextTaskId || undefined,
      taskTitle: finalNextTaskTitle,
      objective: parsedData.session.summary || 'Sessão de atualização registrada via IA',
      startedAt: now,
      endedAt: now,
      durationMinutes: 45,
      status: 'encerrada',
      workDone: (parsedData.session.work_performed || []).join('\n') || parsedData.session.summary || undefined,
      result: parsedData.session.result || 'sucesso',
      testsDone: (parsedData.session.tests_performed || []).join('\n') || parsedData.session.tests_result || undefined,
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
      `Atualização técnica aplicada: Saúde: ${diff.health.new}, Progresso: ${diff.progress.new}%.`,
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
