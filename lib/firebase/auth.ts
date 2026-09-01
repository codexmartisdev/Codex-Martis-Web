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
 * Validates whether the given email corresponds to the authorized operator
 */
export function isAuthorizedOperator(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === AUTHORIZED_OPERATOR_EMAIL;
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
 * Signs in using Firebase Auth GoogleAuthProvider via popup,
 * enforcing operator email verification.
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
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

    if (!isAuthorizedOperator(user.email)) {
      // Account not authorized: forcefully terminate Firebase session
      await firebaseSignOut(auth);
      return {
        success: false,
        error: `Acesso negado (${user.email || 'Conta não identificada'}). Apenas o operador autorizado (${AUTHORIZED_OPERATOR_EMAIL}) tem permissão de comando no Codex Martis.`,
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

    if (error?.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'A janela de autenticação Google foi fechada antes de concluir o login.';
    } else if (error?.code === 'auth/unauthorized-domain') {
      friendlyMessage =
        'Este domínio não está autorizado no Firebase Console. Adicione o domínio atual em Authentication > Settings > Authorized domains.';
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
      if (isAuthorizedOperator(firebaseUser.email)) {
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
        callback({
          user: null,
          isAuthenticated: false,
          authError: `Acesso negado (${firebaseUser.email || 'Conta'}). Apenas o operador (${AUTHORIZED_OPERATOR_EMAIL}) está autorizado.`,
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
