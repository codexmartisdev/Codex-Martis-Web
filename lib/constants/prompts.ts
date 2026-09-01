// Codex Martis Prompt Templates & Schemas

export const DEFAULT_PROJECT_UPDATE_PROMPT = `Você é o assistente técnico de desenvolvimento e engenharia do projeto.
Analise as alterações realizadas, o status atual do código, testes e decisões tomadas.
Gere uma atualização estruturada para o sistema **Codex Martis** seguindo estritamente o schema JSON versão 1.0.

Formato esperado de saída (somente o bloco JSON):
\`\`\`json
{
  "schema_version": "1.0",
  "project_id": "{PROJECT_ID}",
  "health": "saudavel | atencao | bloqueado",
  "progress": 75,
  "status_summary": "Resumo conciso da situação atual",
  "next_mission": {
    "title": "Próxima ação prioritária",
    "why_important": "Justificativa da importância para o objetivo da fase",
    "recommended_tool": "Google AI Studio | Cloud Shell | VS Code"
  },
  "completed_task_ids": ["task_id_1"],
  "completed_task_titles": ["Corrigir persistência no Firestore"],
  "new_tasks": [
    {
      "title": "Título da nova tarefa identificada",
      "description": "Detalhes técnicos",
      "type": "Bug | Feature | Melhoria | Auditoria | Infraestrutura",
      "priority": "Crítica | Alta | Média | Baixa"
    }
  ],
  "resolved_issues": ["Falha no cadastro sem recarregar"],
  "commit": {
    "hash": "d92ac73",
    "message": "Corrige persistência e ajusta regras do Firestore"
  },
  "deploy": {
    "performed": true,
    "environment": "Produção",
    "target": "Vercel"
  },
  "decisions": [
    "Removido escopo secundário de integração para priorizar MVP solo"
  ],
  "state_photograph": {
    "working": ["Autenticação", "Listagem"],
    "partially_working": ["Cadastro de processos"],
    "not_working": [],
    "untested": ["Exportação PDF"]
  }
}
\`\`\``;

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
