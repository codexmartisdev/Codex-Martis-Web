import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  Project,
  Task,
  Session,
  Environment,
  HistoryEvent,
  ProjectUpdate,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore by pinging the test collection from the server.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or initializing.');
    }
    return false;
  }
}

// ==========================================
// PROJECTS FIRESTORE SERVICES
// ==========================================

const PROJECTS_COLLECTION = 'projects';

export async function saveProjectToFirestore(project: Project): Promise<void> {
  try {
    const ref = doc(db, PROJECTS_COLLECTION, project.id);
    await setDoc(ref, project, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PROJECTS_COLLECTION}/${project.id}`);
  }
}

export async function updateProjectInFirestore(
  id: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    const ref = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROJECTS_COLLECTION}/${id}`);
  }
}

export async function deleteProjectFromFirestore(id: string): Promise<void> {
  try {
    const ref = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROJECTS_COLLECTION}/${id}`);
  }
}

export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, PROJECTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Project);
      });
      // Sort projects by updatedAt descending
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for projects:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
    }
  );
}

// ==========================================
// TASKS FIRESTORE SERVICES
// ==========================================

const TASKS_COLLECTION = 'tasks';

export async function saveTaskToFirestore(task: Task): Promise<void> {
  try {
    const ref = doc(db, TASKS_COLLECTION, task.id);
    await setDoc(ref, task, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TASKS_COLLECTION}/${task.id}`);
  }
}

export async function updateTaskInFirestore(
  id: string,
  updates: Partial<Task>
): Promise<void> {
  try {
    const ref = doc(db, TASKS_COLLECTION, id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TASKS_COLLECTION}/${id}`);
  }
}

export async function deleteTaskFromFirestore(id: string): Promise<void> {
  try {
    const ref = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TASKS_COLLECTION}/${id}`);
  }
}

export function subscribeToTasks(
  callback: (tasks: Task[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, TASKS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Task);
      });
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for tasks:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, TASKS_COLLECTION);
    }
  );
}

// ==========================================
// SESSIONS FIRESTORE SERVICES
// ==========================================

const SESSIONS_COLLECTION = 'sessions';

export async function saveSessionToFirestore(session: Session): Promise<void> {
  try {
    const ref = doc(db, SESSIONS_COLLECTION, session.id);
    await setDoc(ref, session, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SESSIONS_COLLECTION}/${session.id}`);
  }
}

export function subscribeToSessions(
  callback: (sessions: Session[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, SESSIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Session[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Session);
      });
      items.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for sessions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SESSIONS_COLLECTION);
    }
  );
}

// ==========================================
// ENVIRONMENTS FIRESTORE SERVICES
// ==========================================

const ENVIRONMENTS_COLLECTION = 'environments';

export async function saveEnvironmentToFirestore(env: Environment): Promise<void> {
  try {
    const ref = doc(db, ENVIRONMENTS_COLLECTION, env.id);
    await setDoc(ref, env, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ENVIRONMENTS_COLLECTION}/${env.id}`);
  }
}

export async function updateEnvironmentInFirestore(
  id: string,
  updates: Partial<Environment>
): Promise<void> {
  try {
    const ref = doc(db, ENVIRONMENTS_COLLECTION, id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ENVIRONMENTS_COLLECTION}/${id}`);
  }
}

export async function deleteEnvironmentFromFirestore(id: string): Promise<void> {
  try {
    const ref = doc(db, ENVIRONMENTS_COLLECTION, id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ENVIRONMENTS_COLLECTION}/${id}`);
  }
}

export function subscribeToEnvironments(
  callback: (envs: Environment[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, ENVIRONMENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Environment[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Environment);
      });
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for environments:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ENVIRONMENTS_COLLECTION);
    }
  );
}

// ==========================================
// HISTORY FIRESTORE SERVICES
// ==========================================

const HISTORY_COLLECTION = 'history';

export async function saveHistoryEventToFirestore(event: HistoryEvent): Promise<void> {
  try {
    const ref = doc(db, HISTORY_COLLECTION, event.id);
    await setDoc(ref, event, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${HISTORY_COLLECTION}/${event.id}`);
  }
}

export function subscribeToHistory(
  callback: (events: HistoryEvent[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, HISTORY_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: HistoryEvent[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as HistoryEvent);
      });
      items.sort((a, b) => b.id.localeCompare(a.id));
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for history:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, HISTORY_COLLECTION);
    }
  );
}

// ==========================================
// PROJECT UPDATES FIRESTORE SERVICES
// ==========================================

const PROJECT_UPDATES_COLLECTION = 'projectUpdates';

export async function saveProjectUpdateToFirestore(update: ProjectUpdate): Promise<void> {
  try {
    const ref = doc(db, PROJECT_UPDATES_COLLECTION, update.id);
    await setDoc(ref, update, { merge: true });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `${PROJECT_UPDATES_COLLECTION}/${update.id}`
    );
  }
}

export function subscribeToProjectUpdates(
  callback: (updates: ProjectUpdate[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, PROJECT_UPDATES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ProjectUpdate[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as ProjectUpdate);
      });
      items.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore onSnapshot error for project updates:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, PROJECT_UPDATES_COLLECTION);
    }
  );
}

// ==========================================
// BATCH SEED MIGRATION TO FIRESTORE
// ==========================================

export async function seedInitialDataToFirestore(
  projects: Project[],
  tasks: Task[],
  environments: Environment[],
  history: HistoryEvent[],
  sessions: Session[]
): Promise<void> {
  try {
    const existing = await getDocs(collection(db, PROJECTS_COLLECTION));
    if (!existing.empty) {
      // Data already in Firestore, do not overwrite
      return;
    }

    const batch = writeBatch(db);

    for (const p of projects) {
      batch.set(doc(db, PROJECTS_COLLECTION, p.id), p);
    }
    for (const t of tasks.slice(0, 50)) {
      batch.set(doc(db, TASKS_COLLECTION, t.id), t);
    }
    for (const e of environments.slice(0, 50)) {
      batch.set(doc(db, ENVIRONMENTS_COLLECTION, e.id), e);
    }
    for (const h of history.slice(0, 50)) {
      batch.set(doc(db, HISTORY_COLLECTION, h.id), h);
    }
    for (const s of sessions.slice(0, 50)) {
      batch.set(doc(db, SESSIONS_COLLECTION, s.id), s);
    }

    await batch.commit();
    console.log('Codex Martis: Seed data successfully synced to Cloud Firestore.');
  } catch (err) {
    console.warn('Could not batch seed data to Firestore:', err);
  }
}
