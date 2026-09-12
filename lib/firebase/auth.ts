import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { UserProfile } from '../types';

// The authorized operator email for Codex Martis v1.0
export const AUTHORIZED_OPERATOR_EMAIL = (
  process.env.NEXT_PUBLIC_AUTHORIZED_OPERATOR_EMAIL || 'codex.martis.dev@gmail.com'
)
  .toLowerCase()
  .trim();

/**
 * Validates whether the given email corresponds to the authorized operator with email verified
 */
export function isAuthorizedOperator(
  email: string | null | undefined,
  emailVerified?: boolean
): boolean {
  if (!email) return false;
  const isEmailMatch = email.toLowerCase().trim() === AUTHORIZED_OPERATOR_EMAIL;
  if (emailVerified !== undefined) {
    return isEmailMatch && emailVerified === true;
  }
  return isEmailMatch;
}

/**
 * Maps a Firebase Auth user to the application's UserProfile
 */
export function mapFirebaseUserToProfile(user: FirebaseUser): UserProfile {
  const name = user.displayName || user.email?.split('@')[0] || 'Operador';
  const nameParts = name.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase() || 'OP';

  return {
    id: user.uid,
    name,
    email: user.email || '',
    role: 'Comandante / Tech Lead',
    avatarInitials: initials,
  };
}

/**
 * Returns the default authorized operator profile for fallback/sandbox environments
 */
export function getOperatorFallbackProfile(): UserProfile {
  return {
    id: 'operator-local-session',
    name: 'Comandante Martis',
    email: AUTHORIZED_OPERATOR_EMAIL,
    role: 'Comandante / Tech Lead',
    avatarInitials: 'CM',
  };
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
  errorCode?: string;
  isUnauthorizedDomain?: boolean;
  currentDomain?: string;
}

/**
 * Signs in using Firebase Auth GoogleAuthProvider via popup,
 * enforcing operator email verification.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isFirebaseConfigured) {
    return {
      success: false,
      error:
        'Firebase não está configurado. Configure as variáveis de ambiente NEXT_PUBLIC_FIREBASE_* para autenticar com Google.',
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;

    if (!isAuthorizedOperator(user.email, user.emailVerified)) {
      // Account not authorized: forcefully terminate Firebase session
      await firebaseSignOut(auth);
      const errorMsg =
        !user.emailVerified && user.email?.toLowerCase().trim() === AUTHORIZED_OPERATOR_EMAIL
          ? `Acesso negado. O e-mail (${user.email}) precisa estar verificado no Firebase Auth para autorizar o comando.`
          : `Acesso negado (${user.email || 'Conta não identificada'}). Apenas o operador autorizado (${AUTHORIZED_OPERATOR_EMAIL}) com e-mail verificado tem permissão de comando no Codex Martis.`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    const profile = mapFirebaseUserToProfile(user);
    return {
      success: true,
      user: profile,
    };
  } catch (error: any) {
    console.error('Firebase Google Auth error:', error);
    let friendlyMessage = 'Falha ao autenticar com o Google. Tente novamente.';
    const isUnauthorizedDomain =
      error?.code === 'auth/unauthorized-domain' ||
      String(error?.message || '').includes('auth/unauthorized-domain');

    const currentDomain =
      typeof window !== 'undefined' ? window.location.hostname : '';

    if (error?.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'A janela de autenticação Google foi fechada antes de concluir o login.';
    } else if (isUnauthorizedDomain) {
      friendlyMessage = `O domínio "${currentDomain || 'atual'}" não está cadastrado na lista de Authorized Domains do Firebase Console. Adicione-o em Authentication > Settings > Authorized domains.`;
    } else if (error?.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Solicitação de autenticação cancelada.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      friendlyMessage =
        'O provedor Google não está ativado no Firebase Console. Ative o Google em Authentication > Sign-in method.';
    } else if (error?.code === 'auth/network-request-failed') {
      friendlyMessage = 'Falha de rede ao comunicar com os servidores de autenticação do Google.';
    } else if (error?.message) {
      friendlyMessage = error.message;
    }

    return {
      success: false,
      error: friendlyMessage,
      errorCode: error?.code,
      isUnauthorizedDomain,
      currentDomain,
    };
  }
}

/**
 * Signs out the current user from Firebase Auth
 */
export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error logging out from Firebase:', error);
    }
  }
}

/**
 * Subscribes to Firebase Auth state updates.
 * Guarantees single-operator enforcement on session restoration.
 */
export function subscribeToAuthState(
  callback: (state: {
    user: UserProfile | null;
    isAuthenticated: boolean;
    authError?: string;
  }) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback({
      user: null,
      isAuthenticated: false,
      authError: undefined,
    });
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      if (isAuthorizedOperator(firebaseUser.email, firebaseUser.emailVerified)) {
        const profile = mapFirebaseUserToProfile(firebaseUser);
        callback({
          user: profile,
          isAuthenticated: true,
        });
      } else {
        // Automatically revoke unauthorized session
        try {
          await firebaseSignOut(auth);
        } catch (e) {
          console.warn('Signout after unauthorized access attempt:', e);
        }
        const errorMsg =
          !firebaseUser.emailVerified &&
          firebaseUser.email?.toLowerCase().trim() === AUTHORIZED_OPERATOR_EMAIL
            ? `Acesso negado. O e-mail (${firebaseUser.email}) precisa estar verificado no Firebase Auth.`
            : `Acesso negado (${firebaseUser.email || 'Conta'}). Apenas o operador autorizado (${AUTHORIZED_OPERATOR_EMAIL}) com e-mail verificado tem permissão de comando.`;
        callback({
          user: null,
          isAuthenticated: false,
          authError: errorMsg,
        });
      }
    } else {
      callback({
        user: null,
        isAuthenticated: false,
      });
    }
  });
}
