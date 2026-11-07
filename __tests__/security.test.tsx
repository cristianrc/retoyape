import { act, renderHook, waitFor } from '@testing-library/react-native';
import { IoSecurity, type SecureEvent } from '@io/native';
import {
  nativeSecurityGateway,
  securityMessage,
  type SecurityGateway,
} from '../src/features/products/security';
import { useSecureCard } from '../src/features/products/useSecureCard';

function fixture() {
  let listener = (_: SecureEvent) => {};
  const remove = jest.fn();
  const gateway: SecurityGateway = {
    requestToken: jest.fn().mockResolvedValue('opaque'),
    open: jest.fn().mockResolvedValue(undefined),
    subscribe: cb => {
      listener = cb;
      return { remove };
    },
  };
  return {
    gateway,
    remove,
    emit: (type: string, code = '', reason = '') =>
      listener({ type, code, reason, cardId: 'card_001' }),
  };
}

test('native adapter forwards opaque arguments and subscription cleanup', async () => {
  await nativeSecurityGateway.requestToken('card_001');
  for (const scenario of ['expired', 'invalid'] as const) {
    await nativeSecurityGateway.requestToken('card_001', scenario);
    expect(IoSecurity.requestDemoToken).toHaveBeenCalledWith(
      'card_001',
      scenario,
    );
  }
  await nativeSecurityGateway.open('card_001', 'opaque');
  const subscription = nativeSecurityGateway.subscribe(jest.fn());
  subscription.remove();
  expect(IoSecurity.requestMockSecureToken).toHaveBeenCalledWith('card_001');
  expect(IoSecurity.openSecureView).toHaveBeenCalledWith('card_001', 'opaque');
});

test('double taps are ignored and closing permits a fresh token', async () => {
  const f = fixture();
  const { result, unmount } = await renderHook(() => useSecureCard(f.gateway));
  await act(async () => {
    await Promise.all([
      result.current.open('card_001'),
      result.current.open('card_001'),
    ]);
  });
  expect(f.gateway.open).toHaveBeenCalledTimes(1);
  expect(result.current.busy).toBe(true);
  await act(() => f.emit('onSecureViewOpened'));
  expect(result.current.message).toMatch(/Abriendo/);
  await act(() => f.emit('onCardDataShown'));
  expect(result.current.message).toMatch(/nativa/);
  await act(() => f.emit('onSecureViewClosed', '', 'USER_DISMISS'));
  expect(result.current.busy).toBe(false);
  await act(async () => {
    await result.current.open('card_001');
  });
  expect(f.gateway.requestToken).toHaveBeenCalledTimes(2);
  await act(() => f.emit('onSecureViewClosed', '', 'TIMEOUT'));
  expect(result.current.message).toMatch(/seguridad/);
  await unmount();
  expect(f.remove).toHaveBeenCalledTimes(1);
});

test.each(['TOKEN_EXPIRED', 'TOKEN_INVALID'])(
  'native validation error %s clears busy state',
  async code => {
    const f = fixture();
    const { result } = await renderHook(() => useSecureCard(f.gateway));
    await act(async () => {
      await result.current.open('card_001');
    });
    await act(() => f.emit('onValidationError', code));
    expect(result.current.busy).toBe(false);
    expect(result.current.message).toMatch(
      code === 'TOKEN_EXPIRED' ? /venció/ : /validar/,
    );
  },
);

test.each(['TOKEN_EXPIRED', 'OPEN_FAILED'])(
  'rejected open %s is recoverable',
  async code => {
    const f = fixture();
    f.gateway.open = jest.fn().mockRejectedValue({ code });
    const { result } = await renderHook(() => useSecureCard(f.gateway));
    await act(async () => {
      await result.current.open('card_001');
    });
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current.message).toMatch(
      code === 'TOKEN_EXPIRED' ? /venció/ : /abrir/,
    );
  },
);

test('a pending token cannot open a screen after unmount', async () => {
  const f = fixture();
  let resolveToken!: (token: string) => void;
  f.gateway.requestToken = jest.fn(
    () =>
      new Promise(resolve => {
        resolveToken = resolve;
      }),
  );
  const { result, unmount } = await renderHook(() => useSecureCard(f.gateway));
  let pending!: Promise<void>;
  await act(() => {
    pending = result.current.open('card_001');
  });
  await unmount();
  await act(async () => {
    resolveToken('opaque');
    await pending;
  });
  expect(f.gateway.open).not.toHaveBeenCalled();
});

test('unknown events do not expose a raw payload', () => {
  expect(
    securityMessage({
      type: 'unknown',
      cardId: 'card_001',
      code: '',
      reason: '',
    }),
  ).toBe('');
});
