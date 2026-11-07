import { useCallback, useEffect, useRef, useState } from 'react';
import {
  nativeSecurityGateway,
  securityMessage,
  type SecurityGateway,
} from './security';

export function useSecureCard(
  gateway: SecurityGateway = nativeSecurityGateway,
) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    'Tus datos completos se muestran en una vista nativa protegida.',
  );
  const active = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const subscription = gateway.subscribe(event => {
      if (!mounted.current) return;
      setMessage(securityMessage(event));
      if (
        event.type === 'onSecureViewClosed' ||
        event.type === 'onValidationError'
      ) {
        active.current = false;
        setBusy(false);
      }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [gateway]);

  const open = useCallback(
    async (
      cardId: string,
      scenario: 'valid' | 'expired' | 'invalid' = 'valid',
    ) => {
      if (active.current) return;
      active.current = true;
      setBusy(true);
      setMessage('Preparando sesión segura…');
      try {
        const token = await gateway.requestToken(cardId, scenario);
        if (!mounted.current) {
          active.current = false;
          return;
        }
        await gateway.open(cardId, token);
      } catch (error) {
        active.current = false;
        if (!mounted.current) return;
        setBusy(false);
        const code = (error as { code?: string })?.code;
        setMessage(
          code === 'TOKEN_EXPIRED'
            ? 'La sesión venció. Vuelve a intentarlo.'
            : 'No se pudo abrir la vista segura. Vuelve a intentarlo.',
        );
      }
    },
    [gateway],
  );

  return { open, busy, message };
}
