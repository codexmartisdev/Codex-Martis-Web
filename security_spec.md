# Security Specification: Codex Martis Firestore Rules

## 1. Data Invariants
1. **Operator Boundary**: All modifications (`create`, `update`, `delete`) must be executed by authenticated operators with verified credentials.
2. **Project Identity**: A project ID must be a valid, sanitized identifier (`isValidId(projectId)`: string up to 128 chars, matching `^[a-zA-Z0-9_\\-]+$`).
3. **Task Relationship**: A task cannot exist without referencing a valid `projectId`.
4. **Environment Relationship**: An environment must reference a valid `projectId`.
5. **Session Relationship**: A session must reference a valid `projectId`.
6. **Progress Integrity**: Project progress must be a numeric value bounded between 0 and 100.
7. **Temporal Consistency**: Documents store ISO timestamps for creation and updates.
8. **Catch-All Default Deny**: Any path outside explicit collection matches is denied by default.

## 2. The "Dirty Dozen" Malicious Payloads
1. **D1: Unauthenticated Creation**: An unauthenticated user attempts to create a project document directly in `/projects/{projectId}`. Expected: `PERMISSION_DENIED`.
2. **D2: ID Poisoning**: An attacker tries to write to `/projects/` using an oversized 2KB malicious ID containing script tags. Expected: `PERMISSION_DENIED`.
3. **D3: Negative Progress Injection**: An attacker attempts to set `progress: -50` on a project. Expected: `PERMISSION_DENIED`.
4. **D4: Exorbitant Progress Range**: An attacker attempts to set `progress: 9999` on a project. Expected: `PERMISSION_DENIED`.
5. **D5: Missing Required Project Fields**: Attempting to create a project missing `name` or `status`. Expected: `PERMISSION_DENIED`.
6. **D6: Task Without Project ID**: Attempting to create a task in `/tasks/{taskId}` with an empty `projectId`. Expected: `PERMISSION_DENIED`.
7. **D7: Oversized String Attack**: Attempting to write a 1MB payload string to `description`. Expected: `PERMISSION_DENIED`.
8. **D8: Unverified Email Write**: Writing with an unverified email token (`email_verified == false`). Expected: `PERMISSION_DENIED`.
9. **D9: Session Missing Objective**: Writing a work session with no objective. Expected: `PERMISSION_DENIED`.
10. **D10: Environment Missing Service**: Creating an environment without `service` or `account`. Expected: `PERMISSION_DENIED`.
11. **D11: Rogue Collection Write**: Attempting to write to arbitrary path `/system_configs/master_key`. Expected: `PERMISSION_DENIED`.
12. **D12: Malformed History Record**: Writing a history event without `title` or `category`. Expected: `PERMISSION_DENIED`.
