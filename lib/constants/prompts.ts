// Codex Martis Prompt Templates & Schemas

export const DEFAULT_PROJECT_UPDATE_PROMPT = `# CODEX MARTIS — ATUALIZAÇÃO DE PROJETO

Você está atuando como assistente técnico/orquestrador de um projeto de desenvolvimento de software.

Com base EXCLUSIVAMENTE:

1. no contexto atual do projeto fornecido pelo Codex Martis; e
2. em tudo que efetivamente ocorreu nesta conversa/sessão de trabalho,

gere uma atualização estruturada compatível com:

CODEX MARTIS PROJECT UPDATE SCHEMA 1.0

O objetivo é informar ao Codex Martis:

- o estado atual do projeto;
- o que foi realizado;
- o que foi corrigido;
- o que continua pendente;
- quais problemas foram identificados;
- quais problemas foram resolvidos;
- quais decisões foram tomadas;
- quais alterações técnicas foram realizadas;
- quais ambientes foram alterados;
- qual commit foi produzido;
- se houve deploy;
- qual é a fotografia funcional atual;
- qual deve ser a próxima ação principal.

REGRAS DE CONFIABILIDADE

1. Analise toda a sessão atual antes de gerar a resposta.

2. Não invente informações.

3. Não presuma que algo foi concluído apenas porque foi sugerido.

4. Diferencie claramente:

- discutido
- planejado
- executado
- executado não validado
- testado
- confirmado funcionando

5. Uma tarefa somente pode ser marcada como:

"concluida"

quando houver evidência suficiente de conclusão real.

6. Se algo foi implementado mas ainda não foi validado, utilizar:

"executada_nao_validada"

7. Um problema somente pode ser marcado:

"resolvido"

quando houver evidência suficiente de correção e validação.

8. Não trate ausência de erro como comprovação de funcionamento.

9. Quando não houver informação:

valor único → null
lista → []

10. Não inclua:

- senhas
- API keys
- tokens
- secrets
- private keys
- cookies
- service accounts
- credenciais

11. Preserve exatamente quando conhecidos:

- projectId
- task IDs
- commit hashes
- branches
- nomes técnicos
- URLs públicas

12. Não utilize Markdown na resposta final.

13. Não escreva explicações antes ou depois.

14. Retorne SOMENTE JSON válido.

CLASSIFICAÇÕES:

project_status:
- "planejamento"
- "desenvolvimento"
- "teste"
- "producao"
- "pausado"
- "encerrado"

project_health:
- "saudavel"
- "atencao"
- "bloqueado"
- "nao_avaliado"

session.result:
- "sucesso"
- "sucesso_parcial"
- "sem_alteracoes"
- "falha"
- "indeterminado"

task.status:
- "pendente"
- "em_andamento"
- "executada_nao_validada"
- "concluida"
- "cancelada"

task.type:
- "bug"
- "melhoria"
- "feature"
- "auditoria"
- "infraestrutura"
- "teste"
- "documentacao"
- "ideia"
- "outro"

priority:
- "critica"
- "alta"
- "media"
- "baixa"

issue.status:
- "aberto"
- "em_correcao"
- "corrigido_nao_validado"
- "resolvido"
- "aceito"
- "descartado"

FORMATO EXATO:

{
  "schema_version": "1.0",
  "update_type": "project_update",

  "project": {
    "identifier": null,
    "project_status": null,
    "project_health": null,
    "current_phase": null,
    "current_objective": null,
    "progress": null
  },

  "session": {
    "summary": null,
    "result": null,
    "work_performed": [],
    "tests_performed": [],
    "tests_result": null
  },

  "completed_tasks": [
    {
      "task_id": null,
      "title": null,
      "type": null,
      "priority": null,
      "status": "concluida",
      "description": null
    }
  ],

  "updated_tasks": [
    {
      "task_id": null,
      "title": null,
      "type": null,
      "priority": null,
      "previous_status": null,
      "status": null,
      "description": null
    }
  ],

  "new_tasks": [
    {
      "title": null,
      "type": null,
      "priority": null,
      "status": "pendente",
      "description": null
    }
  ],

  "issues": [
    {
      "title": null,
      "severity": null,
      "status": null,
      "description": null,
      "evidence": null
    }
  ],

  "resolved_issues": [
    {
      "title": null,
      "severity": null,
      "status": "resolvido",
      "resolution": null,
      "validation": null
    }
  ],

  "decisions": [
    {
      "title": null,
      "decision": null,
      "reason": null,
      "impact": null
    }
  ],

  "technical_changes": [
    {
      "area": null,
      "description": null,
      "status": null
    }
  ],

  "environment_changes": [
    {
      "environment_id": null,
      "service": null,
      "environment": null,
      "change": null,
      "result": null
    }
  ],

  "repository": {
    "repository_name": null,
    "branch": null,
    "commit": null,
    "commit_message": null,
    "commit_status": null
  },

  "deployment": {
    "performed": false,
    "platform": null,
    "environment": null,
    "url": null,
    "status": null
  },

  "known_state": {
    "working": [],
    "partially_working": [],
    "not_working": [],
    "not_tested": [],
    "out_of_scope": []
  },

  "next_action": {
    "task_id": null,
    "title": null,
    "description": null,
    "priority": null,
    "recommended_tool": null,
    "reason": null
  },

  "recommended_follow_up": [],

  "context_summary": null
}

REGRAS FINAIS

context_summary deve permitir que outro assistente de IA retome o trabalho futuramente.

Incluir quando relevante:

- objetivo
- estado atual
- alterações
- problemas
- decisões
- testes
- commit
- deploy
- próxima missão

next_action deve conter SOMENTE UMA ação.

Deve ser específica e executável.

RUIM:

"Continuar o projeto."

BOM:

"Validar a persistência das tarefas no Firestore após recarregar a aplicação e corrigir eventuais divergências encontradas."

Sempre prefira:

"não testado"

em vez de:

"funcionando"

quando não houver validação.

Sempre prefira:

"executada_nao_validada"

em vez de:

"concluida"

quando a implementação ainda não tiver sido validada.

Agora analise todo o contexto fornecido e a sessão atual e retorne SOMENTE o JSON válido.`;

export const DEFAULT_PROJECT_IMPORT_PROMPT = `# CODEX MARTIS — ANÁLISE INICIAL DE REPOSITÓRIO

Você está realizando a análise inicial de um repositório de software para cadastrá-lo no sistema Codex Martis.

Analise profundamente o repositório GitHub disponível nesta conversa ou ambiente.

O objetivo NÃO é modificar o código.

O objetivo é produzir uma fotografia técnica inicial do projeto e retornar um JSON compatível com:

CODEX MARTIS PROJECT IMPORT SCHEMA 1.0

Analise, quando disponíveis:

- estrutura de diretórios;
- package.json;
- README;
- arquivos de configuração;
- framework;
- linguagens;
- dependências;
- arquitetura;
- frontend;
- backend;
- autenticação;
- banco de dados;
- APIs;
- serviços externos;
- infraestrutura;
- deploy;
- armazenamento;
- envio de e-mails;
- variáveis de ambiente REFERENCIADAS;
- lógica principal;
- funcionalidades existentes;
- funcionalidades incompletas;
- mocks;
- dados fictícios;
- TODOs;
- código simulado;
- problemas técnicos;
- riscos;
- dívida técnica;
- testes;
- documentação.

REGRAS DE CONFIABILIDADE

1. Baseie-se somente em evidências encontradas no repositório.

2. Não invente informações.

3. Diferencie claramente:

- recurso presente no código;
- recurso configurado;
- recurso aparentemente implementado;
- recurso testado;
- recurso comprovadamente funcionando.

4. A presença de uma integração no código NÃO significa que ela funciona em produção.

5. Não informe que um serviço está:

- online;
- operacional;
- saudável;
- conectado;
- disponível;

sem evidência concreta.

6. Caso não seja possível determinar a saúde do projeto, utilize:

"project_health": "nao_avaliado"

7. Caso não seja possível determinar progresso, utilize:

"progress": null

8. Não exponha:

- senhas;
- API keys;
- tokens;
- secrets;
- cookies;
- private keys;
- service accounts;
- credenciais.

9. Você pode informar NOMES de variáveis de ambiente, mas nunca seus valores secretos.

10. Se encontrar possível segredo exposto no repositório, NÃO reproduza seu valor.

Registre apenas um problema semelhante a:

"Possível segredo exposto no repositório."

Severity:
"critica"

11. Não altere o código.

12. Não utilize Markdown na resposta final.

13. Não escreva explicações antes ou depois do JSON.

14. Retorne SOMENTE um objeto JSON válido.

CLASSIFICAÇÕES

project_status:

- "planejamento"
- "desenvolvimento"
- "teste"
- "producao"
- "pausado"
- "encerrado"
- null

project_health:

- "saudavel"
- "atencao"
- "bloqueado"
- "nao_avaliado"

task.type:

- "bug"
- "melhoria"
- "feature"
- "auditoria"
- "infraestrutura"
- "teste"
- "documentacao"
- "ideia"
- "outro"

priority / severity:

- "critica"
- "alta"
- "media"
- "baixa"

configuration_status:

- "detected_in_code"
- "configured"
- "not_confirmed"

FORMATO EXATO DA RESPOSTA:

{
  "schema_version": "1.0",
  "import_type": "project_creation",

  "source": {
    "type": "github_repository",
    "repository_name": null,
    "repository_url": null,
    "branch_analyzed": null,
    "commit_analyzed": null,
    "analysis_date": null
  },

  "project": {
    "name": null,
    "identifier": null,
    "description": null,
    "type": null,
    "project_status": null,
    "project_health": "nao_avaliado",
    "current_phase": null,
    "current_objective": null,
    "progress": null
  },

  "repository": {
    "owner": null,
    "name": null,
    "default_branch": null,
    "framework": null,
    "language": [],
    "package_manager": null
  },

  "tech_stack": {
    "frontend": [],
    "backend": [],
    "database": [],
    "authentication": [],
    "hosting": [],
    "email": [],
    "storage": [],
    "other": []
  },

  "detected_services": [
    {
      "service": null,
      "category": null,
      "evidence": null,
      "configuration_status": null,
      "project_identifier": null,
      "url": null
    }
  ],

  "current_state": {
    "working": [],
    "partially_working": [],
    "not_working": [],
    "not_tested": [],
    "out_of_scope": []
  },

  "initial_tasks": [
    {
      "title": null,
      "description": null,
      "type": null,
      "priority": null,
      "status": "pendente",
      "evidence": null
    }
  ],

  "issues": [
    {
      "title": null,
      "description": null,
      "severity": null,
      "evidence": null
    }
  ],

  "next_action": {
    "title": null,
    "description": null,
    "priority": null,
    "recommended_tool": null,
    "reason": null
  },

  "context_summary": null,

  "analysis_confidence": {
    "overall": null,
    "limitations": []
  }
}

REGRAS FINAIS

O campo context_summary deve conter uma síntese técnica suficiente para que outro assistente de IA consiga compreender posteriormente:

- o objetivo do projeto;
- a arquitetura principal;
- as tecnologias utilizadas;
- o estado atual;
- problemas relevantes;
- limitações;
- próxima ação recomendada.

O campo next_action deve conter SOMENTE UMA ação principal.

Essa ação deve ser específica e executável.

RUIM:

"Continuar desenvolvendo o sistema."

BOM:

"Substituir a persistência local de projetos por Firestore e validar leitura e gravação após recarregar a aplicação."

Em analysis_confidence.overall, utilizar preferencialmente:

- "alta"
- "media"
- "baixa"

Em limitations, informe limitações reais da análise.

Exemplo:

"Não foi possível validar o ambiente de produção."

"Variáveis de ambiente não estavam disponíveis."

"Não foi possível executar testes automatizados."

Agora analise completamente o repositório e retorne SOMENTE o JSON válido.`;
