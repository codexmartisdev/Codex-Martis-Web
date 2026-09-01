import {
  Project,
  Task,
  Environment,
  HistoryEvent,
  ProjectStatus,
  ProjectHealth,
  TaskPriority,
  TaskType,
  ProjectImportSchema1,
  ProjectImportOrigin,
} from './types';

export interface ValidationResult {
  success: boolean;
  error?: string;
  parsedData?: ProjectImportSchema1;
  duplicateWarning?: {
    isDuplicate: boolean;
    existingProject?: Project;
    reason?: string;
  };
  hasRemovedSecrets?: boolean;
  rawJsonString?: string;
}

// Regex to detect obvious secrets, bearer tokens, or private keys
const SENSITIVE_PATTERNS = [
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/gi,
  /(?:bearer\s+|token\s*[:=]\s*|api[_-]?key\s*[:=]\s*|secret\s*[:=]\s*|password\s*[:=]\s*|pwd\s*[:=]\s*)["']?([a-zA-Z0-9_\-\.]{20,})["']?/gi,
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT
  /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
];

/**
 * Sanitizes object strings from potentially exposed secrets
 */
function sanitizeSecretsDeep(obj: any): { sanitized: any; removedCount: number } {
  let removedCount = 0;

  function recursiveSanitize(val: any): any {
    if (typeof val === 'string') {
      let result = val;
      for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(result)) {
          removedCount++;
          result = result.replace(pattern, '[REMOVIDO POR SEGURANÇA]');
        }
      }
      return result;
    } else if (Array.isArray(val)) {
      return val.map(recursiveSanitize);
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
          // If the key is sensitive and contains a suspicious long value
          if (typeof val[key] === 'string' && val[key].length > 10) {
            removedCount++;
            copy[key] = '[REMOVIDO POR SEGURANÇA]';
            continue;
          }
        }
        copy[key] = recursiveSanitize(val[key]);
      }
      return copy;
    }
    return val;
  }

  const sanitized = recursiveSanitize(obj);
  return { sanitized, removedCount };
}

/**
 * Validates a JSON string against CODEX MARTIS PROJECT IMPORT SCHEMA 1.0
 */
export function validateProjectImportJson(
  jsonString: string,
  existingProjects: Project[] = []
): ValidationResult {
  try {
    let clean = jsonString.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    if (!clean) {
      return { success: false, error: 'JSON não fornecido. Cole o conteúdo JSON para validação.' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr: any) {
      return { success: false, error: `JSON inválido: ${parseErr.message}` };
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, error: 'O conteúdo fornecido não é um objeto JSON válido.' };
    }

    // Check for Project Update crossover
    if (
      parsed.import_type === 'project_update' ||
      (parsed.project_id && parsed.import_type !== 'project_creation')
    ) {
      return {
        success: false,
        error: 'Este JSON pertence ao fluxo de atualização de projeto (Project Update) e não ao de criação de projeto.',
      };
    }

    // 1. Schema version
    if (!parsed.schema_version) {
      return {
        success: false,
        error: 'Campo obrigatório "schema_version" não encontrado no JSON.',
      };
    }

    if (String(parsed.schema_version) !== '1.0') {
      return {
        success: false,
        error: `Versão de schema "${parsed.schema_version}" incompatível. Esperado: "1.0".`,
      };
    }

    // 2. Import type
    if (!parsed.import_type) {
      return {
        success: false,
        error: 'Campo obrigatório "import_type" não encontrado no JSON.',
      };
    }

    if (parsed.import_type !== 'project_creation') {
      return {
        success: false,
        error: `Tipo de importação "${parsed.import_type}" incompatível. Esperado: "project_creation".`,
      };
    }

    // 3. Project section & Project Name
    if (!parsed.project || typeof parsed.project !== 'object') {
      return {
        success: false,
        error: 'Objeto obrigatório "project" não encontrado.',
      };
    }

    if (
      !parsed.project.name ||
      typeof parsed.project.name !== 'string' ||
      !parsed.project.name.trim()
    ) {
      return {
        success: false,
        error: 'Campo obrigatório project.name não encontrado.',
      };
    }

    // Sanitize any secrets
    const { sanitized, removedCount } = sanitizeSecretsDeep(parsed);
    const sanitizedData = sanitized as ProjectImportSchema1;

    // Check for duplicates
    let duplicateWarning: ValidationResult['duplicateWarning'] = undefined;
    const targetIdentifier = (
      sanitizedData.project.identifier ||
      sanitizedData.project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    )
      .toLowerCase()
      .trim();

    const targetRepoUrl = sanitizedData.source?.repository_url?.toLowerCase().trim();
    const targetRepoOwner = sanitizedData.repository?.owner?.toLowerCase().trim();
    const targetRepoName = sanitizedData.repository?.name?.toLowerCase().trim();
    const targetName = sanitizedData.project.name.toLowerCase().trim();

    const duplicate = existingProjects.find((p) => {
      const pId = p.id.toLowerCase().trim();
      const pIdent = p.identifier.toLowerCase().trim();
      const pName = p.name.toLowerCase().trim();

      // Check identifier match
      if (pId === targetIdentifier || pIdent === targetIdentifier) {
        return true;
      }

      // Check repository URL match if available in import origin
      if (
        targetRepoUrl &&
        p.importOrigin?.repositoryUrl &&
        p.importOrigin.repositoryUrl.toLowerCase().trim() === targetRepoUrl
      ) {
        return true;
      }

      // Check repository owner/name match
      if (
        targetRepoOwner &&
        targetRepoName &&
        p.repositoryInfo?.owner?.toLowerCase().trim() === targetRepoOwner &&
        p.repositoryInfo?.name?.toLowerCase().trim() === targetRepoName
      ) {
        return true;
      }

      // Check exact project name
      if (pName === targetName) {
        return true;
      }

      return false;
    });

    if (duplicate) {
      let reason = 'Identificador ou nome já cadastrado no sistema.';
      if (targetRepoUrl && duplicate.importOrigin?.repositoryUrl === targetRepoUrl) {
        reason = `URL de repositório (${targetRepoUrl}) já vinculada ao projeto "${duplicate.name}".`;
      } else if (targetIdentifier === duplicate.identifier.toLowerCase()) {
        reason = `Identificador "${targetIdentifier}" já utilizado pelo projeto "${duplicate.name}".`;
      } else if (targetName === duplicate.name.toLowerCase()) {
        reason = `Já existe um projeto cadastrado com o nome "${duplicate.name}".`;
      }

      duplicateWarning = {
        isDuplicate: true,
        existingProject: duplicate,
        reason,
      };
    }

    return {
      success: true,
      parsedData: sanitizedData,
      duplicateWarning,
      hasRemovedSecrets: removedCount > 0,
      rawJsonString: clean,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao processar JSON de importação: ${err.message}`,
    };
  }
}

/**
 * Translates configuration status of detected services to human-readable label
 */
export function getServiceConfigurationLabel(status: string | null | undefined): string {
  switch (status) {
    case 'detected_in_code':
      return 'DETECTADO NO CÓDIGO';
    case 'configured':
      return 'CONFIGURAÇÃO IDENTIFICADA';
    case 'not_confirmed':
      return 'NÃO CONFIRMADO';
    default:
      return status ? status.toUpperCase() : 'NÃO CONFIRMADO';
  }
}

/**
 * Maps severity from analysis issues to TaskPriority
 */
export function mapSeverityToTaskPriority(severity: string | null | undefined): TaskPriority {
  switch (severity?.toLowerCase()) {
    case 'critica':
    case 'crítica':
      return 'Crítica';
    case 'alta':
      return 'Alta';
    case 'media':
    case 'média':
      return 'Média';
    case 'baixa':
      return 'Baixa';
    default:
      return 'Média';
  }
}

/**
 * Maps task type from import JSON to TaskType
 */
export function mapImportTaskType(type: string | null | undefined): TaskType {
  switch (type?.toLowerCase()) {
    case 'bug':
      return 'Bug';
    case 'melhoria':
      return 'Melhoria';
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
    default:
      return 'Melhoria';
  }
}

/**
 * Builds the set of entities (Project, Tasks, Environments, HistoryEvent)
 * from the validated and reviewed ProjectImportSchema1 data.
 */
export function buildEntitiesFromProjectImport(
  data: ProjectImportSchema1,
  currentUser: { name?: string; email?: string } | null,
  rawJsonString?: string
): {
  project: Project;
  tasks: Task[];
  environments: Environment[];
  historyEvent: HistoryEvent;
} {
  const now = new Date().toISOString();
  const rawId = (
    data.project.identifier ||
    data.project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  )
    .toLowerCase()
    .trim();
  const projectId = rawId || `proj-${Date.now()}`;
  const projectName = data.project.name.trim();

  // Normalize project status
  let projectStatus: ProjectStatus = 'desenvolvimento';
  const rawStatus = data.project.project_status?.toLowerCase();
  if (
    rawStatus === 'planejamento' ||
    rawStatus === 'desenvolvimento' ||
    rawStatus === 'teste' ||
    rawStatus === 'producao' ||
    rawStatus === 'pausado' ||
    rawStatus === 'encerrado'
  ) {
    projectStatus = rawStatus;
  }

  // Normalize project health
  let projectHealth: ProjectHealth = 'nao_avaliado';
  const rawHealth = data.project.project_health?.toLowerCase();
  if (
    rawHealth === 'saudavel' ||
    rawHealth === 'atencao' ||
    rawHealth === 'bloqueado' ||
    rawHealth === 'nao_avaliado'
  ) {
    projectHealth = rawHealth;
  }

  const tasks: Task[] = [];

  // 1. Convert initial_tasks to real Tasks
  if (Array.isArray(data.initial_tasks)) {
    data.initial_tasks.forEach((it, idx) => {
      if (it && it.title && it.title.trim()) {
        const taskId = `task-${projectId}-init-${idx + 1}-${Date.now()}`;
        tasks.push({
          id: taskId,
          projectId,
          projectName,
          title: it.title.trim(),
          description: `${it.description || ''}${
            it.evidence ? `\n\nEvidência técnica: ${it.evidence}` : ''
          }\n\nOrigem: análise inicial do repositório por IA.`,
          type: mapImportTaskType(it.type),
          priority: (it.priority ? mapSeverityToTaskPriority(it.priority) : 'Média') as TaskPriority,
          status: 'Pendente',
          assignedTo: currentUser?.name || 'Operador',
          isNextMission: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  }

  // 2. Convert issues to Tasks (type: 'Auditoria')
  if (Array.isArray(data.issues)) {
    data.issues.forEach((iss, idx) => {
      if (iss && iss.title && iss.title.trim()) {
        const taskId = `task-${projectId}-issue-${idx + 1}-${Date.now()}`;
        tasks.push({
          id: taskId,
          projectId,
          projectName,
          title: `[Achado Técnico] ${iss.title.trim()}`,
          description: `${iss.description || 'Problema ou limitação identificada durante a análise.'}\n\nOrigem: análise inicial do repositório.${
            iss.evidence ? `\nEvidência: ${iss.evidence}` : ''
          }`,
          type: 'Auditoria',
          priority: mapSeverityToTaskPriority(iss.severity),
          status: 'Pendente',
          assignedTo: currentUser?.name || 'Operador',
          isNextMission: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  }

  // 3. Resolve Next Mission and link to project.nextTaskId
  let nextTaskId: string | null = null;
  let nextTaskTitle = 'Setup inicial de arquitetura e validação de ambiente';
  let nextTaskWhyImportant = 'Estruturar e validar o ambiente de desenvolvimento inicial.';
  let recommendedTool = 'Google AI Studio';

  if (data.next_action && data.next_action.title && data.next_action.title.trim()) {
    nextTaskTitle = data.next_action.title.trim();
    if (data.next_action.reason) {
      nextTaskWhyImportant = data.next_action.reason.trim();
    }
    if (data.next_action.recommended_tool) {
      recommendedTool = data.next_action.recommended_tool.trim();
    }

    // Check if an existing initial task has equivalent title
    const matchingTask = tasks.find(
      (t) => t.title.toLowerCase() === nextTaskTitle.toLowerCase()
    );

    if (matchingTask) {
      nextTaskId = matchingTask.id;
      matchingTask.isNextMission = true;
    } else {
      // Create dedicated Next Mission task
      const missionTaskId = `task-${projectId}-mission-${Date.now()}`;
      const missionTask: Task = {
        id: missionTaskId,
        projectId,
        projectName,
        title: nextTaskTitle,
        description: `${data.next_action.description || nextTaskWhyImportant}\n\nOrigem: Próxima ação recomendada pela análise de repositório.`,
        type: 'Feature',
        priority: (data.next_action.priority
          ? mapSeverityToTaskPriority(data.next_action.priority)
          : 'Alta') as TaskPriority,
        status: 'Pendente',
        assignedTo: currentUser?.name || 'Operador',
        isNextMission: true,
        createdAt: now,
        updatedAt: now,
      };
      tasks.unshift(missionTask);
      nextTaskId = missionTaskId;
    }
  } else if (tasks.length > 0) {
    // Fallback: use first task as next mission
    tasks[0].isNextMission = true;
    nextTaskId = tasks[0].id;
    nextTaskTitle = tasks[0].title;
  }

  // 4. Build detected Environments / Services
  const environments: Environment[] = [];
  if (Array.isArray(data.detected_services)) {
    data.detected_services.forEach((ds, idx) => {
      if (ds && ds.service && ds.service.trim()) {
        const sName = ds.service.trim();
        const confLabel = getServiceConfigurationLabel(ds.configuration_status);
        const envId = `env-${projectId}-${idx + 1}-${Date.now()}`;

        let category = 'Serviço de Terceiros';
        if (ds.category) {
          category = ds.category;
        } else if (sName.toLowerCase().includes('firebase')) {
          category = 'Firebase';
        } else if (sName.toLowerCase().includes('vercel')) {
          category = 'Vercel';
        } else if (sName.toLowerCase().includes('github')) {
          category = 'GitHub';
        } else if (sName.toLowerCase().includes('resend')) {
          category = 'Resend';
        }

        const badgeCode = sName.slice(0, 4).toUpperCase();

        environments.push({
          id: envId,
          projectId,
          projectName,
          name: sName,
          badgeCode,
          category,
          service: sName,
          account: currentUser?.email || 'codex.martis.dev@gmail.com',
          status: confLabel === 'CONFIGURAÇÃO IDENTIFICADA' ? 'Ativo' : 'Configurado',
          identifier: ds.project_identifier || undefined,
          url: ds.url || undefined,
          observations: `Status: ${confLabel}.${ds.evidence ? ` Evidência: ${ds.evidence}.` : ''} Fonte da informação: Análise de repositório por IA.`,
          updatedAt: now,
        });
      }
    });
  }

  // 5. Origin traceability record
  const importOrigin: ProjectImportOrigin = {
    schemaVersion: data.schema_version || '1.0',
    importType: data.import_type || 'project_creation',
    repositoryUrl: data.source?.repository_url || undefined,
    repositoryName: data.source?.repository_name || data.repository?.name || undefined,
    branchAnalyzed: data.source?.branch_analyzed || data.repository?.default_branch || undefined,
    commitAnalyzed: data.source?.commit_analyzed || undefined,
    analysisDate: data.source?.analysis_date || now,
    importedAt: now,
    analysisConfidence: data.analysis_confidence?.overall || undefined,
    limitations: data.analysis_confidence?.limitations || [],
  };

  // 6. Build Project Entity
  const project: Project = {
    id: projectId,
    name: projectName,
    identifier: (data.project.identifier || projectId).toUpperCase(),
    description:
      data.project.description ||
      data.context_summary ||
      'Projeto importado a partir de análise de repositório por IA.',
    type: data.project.type || data.repository?.framework || 'Projeto Web',
    status: projectStatus,
    phase: data.project.current_phase || 'Setup Inicial',
    health: projectHealth,
    progress: typeof data.project.progress === 'number' ? data.project.progress : 0,
    objective:
      data.project.current_objective ||
      'Estruturar a base inicial do projeto e validar arquitetura.',
    nextTaskId,
    nextTaskTitle,
    nextTaskWhyImportant,
    recommendedTool,
    priority: 'alta',
    mainAccount: currentUser?.email || 'codex.martis.dev@gmail.com',
    statePhoto: {
      working: data.current_state?.working || [],
      partiallyWorking: data.current_state?.partially_working || [],
      notWorking: data.current_state?.not_working || [],
      untested: data.current_state?.not_tested || [],
      outOfScope: data.current_state?.out_of_scope || [],
    },
    lastCommit: data.source?.commit_analyzed || undefined,
    importOrigin,
    contextSummary: data.context_summary || undefined,
    techStack: data.tech_stack,
    repositoryInfo: data.repository,
    createdAt: now,
    updatedAt: now,
  };

  // 7. Build History Event
  const historyEvent: HistoryEvent = {
    id: `hist-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: 'PROJECT_IMPORTED',
    category: 'PROJETO',
    projectId,
    projectName,
    title: 'PROJETO CRIADO VIA ANÁLISE DE REPOSITÓRIO',
    description: `Projeto criado através do Codex Martis Project Import Schema 1.0.${
      data.source?.repository_url ? ` Repositório: ${data.source.repository_url}` : ''
    }`,
    commitHash: data.source?.commit_analyzed || undefined,
    timestamp: now,
    user: currentUser?.name || 'Operador',
  };

  return {
    project,
    tasks,
    environments,
    historyEvent,
  };
}
