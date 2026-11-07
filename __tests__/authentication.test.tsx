import React from 'react';
import { Text, Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  firebaseAuthentication,
  authenticationMessage,
  type Authentication,
  type SessionUser,
} from '../src/features/auth/authentication';
import { SessionProvider } from '../src/features/auth/session';
import { SessionGate } from '../src/features/auth/SessionGate';
import { LoginScreen } from '../src/features/auth/LoginScreen';
import { AppHeader } from '../src/app/AppHeader';

function fixture() {
  let listener = (_: SessionUser | null) => {};
  const remove = jest.fn();
  const authentication: Authentication = {
    observe: cb => {
      listener = cb;
      return remove;
    },
    signIn: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
  };
  return {
    authentication,
    remove,
    emit: (user: SessionUser | null) => listener(user),
  };
}
afterEach(() => jest.clearAllMocks());

test('session restoration gates dashboard, clears it on sign-out and cleans subscription', async () => {
  const f = fixture();
  const screen = await render(
    <SessionProvider authentication={f.authentication}>
      <SessionGate>
        <Text>Dashboard</Text>
      </SessionGate>
    </SessionProvider>,
  );
  expect(screen.getByText('Preparando tu sesión…')).toBeTruthy();
  expect(screen.queryByText('Dashboard')).toBeNull();
  await act(() => f.emit(null));
  expect(screen.getByText('Inicia sesión')).toBeTruthy();
  await act(() => f.emit({ id: 'demo', email: 'demo@retoyape.com' }));
  expect(screen.getByText('Dashboard')).toBeTruthy();
  expect(screen.queryByText('Inicia sesión')).toBeNull();
  await act(() => f.emit(null));
  expect(screen.queryByText('Dashboard')).toBeNull();
  await screen.unmount();
  expect(f.remove).toHaveBeenCalledTimes(1);
});

test('login validates fields and hides password, without sending invalid input', async () => {
  const signIn = jest.fn();
  const screen = await render(<LoginScreen signIn={signIn} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByText('Ingresa tu correo y contraseña.')).toBeTruthy();
  await fireEvent.changeText(
    screen.getByLabelText('Correo electrónico'),
    'invalid',
  );
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'password');
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
  expect(signIn).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Mostrar contraseña' }),
  );
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
});

test('login trims email, keeps password exact, prevents duplicate submissions and permits retry', async () => {
  let reject: (error: unknown) => void = () => {};
  const signIn = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    )
    .mockResolvedValue(undefined);
  const screen = await render(<LoginScreen signIn={signIn} />);
  await fireEvent.changeText(
    screen.getByLabelText('Correo electrónico'),
    ' demo@retoyape.com ',
  );
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), ' password ');
  await act(() => {
    screen.getByLabelText('Contraseña').props.onSubmitEditing();
  });
  expect(screen.getByRole('button', { name: 'Ingresando…' })).toBeDisabled();
  await fireEvent(screen.getByLabelText('Contraseña'), 'submitEditing');
  expect(signIn).toHaveBeenCalledTimes(1);
  expect(signIn).toHaveBeenCalledWith('demo@retoyape.com', ' password ');
  await act(() => reject({ code: 'auth/invalid-credential' }));
  expect(
    screen.getByText('El correo o la contraseña no son correctos.'),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Contraseña').props.value).toBe(''),
  );
});

test('firebase adapter delegates credentials, maps public user fields and unsubscribes', async () => {
  const unsubscribe = jest.fn();
  jest.mocked(onAuthStateChanged).mockImplementationOnce((_auth, listener) => {
    if (typeof listener === 'function') {
      listener({ uid: 'user-1', email: 'demo@retoyape.com' } as never);
      listener(null);
    }
    return unsubscribe;
  });
  const listener = jest.fn();
  const stop = firebaseAuthentication.observe(listener);
  expect(listener.mock.calls).toEqual([
    [{ id: 'user-1', email: 'demo@retoyape.com' }],
    [null],
  ]);
  await firebaseAuthentication.signIn(
    'demo@retoyape.com',
    'test-only-password',
  );
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
    getAuth(),
    'demo@retoyape.com',
    'test-only-password',
  );
  await firebaseAuthentication.signOut();
  expect(signOut).toHaveBeenCalledWith(getAuth());
  stop();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});

test('header sign-out requires deliberate action and reports failure', async () => {
  const f = fixture();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  f.authentication.signOut = jest
    .fn()
    .mockRejectedValue({ code: 'auth/network-request-failed' });
  const screen = await render(
    <SessionProvider authentication={f.authentication}>
      <AppHeader />
    </SessionProvider>,
  );
  await act(() => f.emit({ id: 'demo', email: null }));
  await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(f.authentication.signOut).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2]!;
  await act(() => buttons.find(b => b.text === 'Salir')!.onPress!());
  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'No pudimos cerrar la sesión',
      'Revisa tu conexión e inténtalo nuevamente.',
    ),
  );
  alert.mockRestore();
});

test.each([
  ['auth/invalid-email', 'Ingresa un correo válido.'],
  ['auth/user-not-found', 'El correo o la contraseña no son correctos.'],
  ['auth/wrong-password', 'El correo o la contraseña no son correctos.'],
  [
    'auth/invalid-login-credentials',
    'El correo o la contraseña no son correctos.',
  ],
  ['auth/user-disabled', 'Esta cuenta está deshabilitada.'],
  [
    'auth/too-many-requests',
    'Demasiados intentos. Espera un momento y vuelve a intentar.',
  ],
  ['auth/network-request-failed', 'Revisa tu conexión e inténtalo nuevamente.'],
  ['unknown', 'No pudimos completar la solicitud. Inténtalo nuevamente.'],
])('maps %s to a safe message', (code, message) => {
  expect(
    authenticationMessage({ code, message: 'internal sensitive detail' }),
  ).toBe(message);
});
