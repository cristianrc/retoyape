import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

export type SessionUser = { id: string; email: string | null };
export type Authentication = {
  observe(listener: (user: SessionUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

export const firebaseAuthentication: Authentication = {
  observe: listener =>
    onAuthStateChanged(getAuth(), user =>
      listener(user ? { id: user.uid, email: user.email } : null),
    ),
  async signIn(email, password) {
    await signInWithEmailAndPassword(getAuth(), email, password);
  },
  signOut: () => signOut(getAuth()),
};

export function loginValidation(
  email: string,
  password: string,
): string | null {
  if (!email.trim() || !password) return 'Ingresa tu correo y contraseña.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Ingresa un correo válido.';
  return null;
}

export function authenticationMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'Ingresa un correo válido.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'El correo o la contraseña no son correctos.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    case 'auth/network-request-failed':
      return 'Revisa tu conexión e inténtalo nuevamente.';
    default:
      return 'No pudimos completar la solicitud. Inténtalo nuevamente.';
  }
}
