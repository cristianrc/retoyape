import { IoSecurity, type SecureEvent } from '@io/native';

export interface SecurityGateway {
  requestToken(
    cardId: string,
    scenario?: 'valid' | 'expired' | 'invalid',
  ): Promise<string>;
  open(cardId: string, token: string): Promise<void>;
  subscribe(listener: (event: SecureEvent) => void): { remove(): void };
}

export const nativeSecurityGateway: SecurityGateway = {
  requestToken: (cardId, scenario = 'valid') =>
    scenario === 'valid'
      ? IoSecurity.requestMockSecureToken(cardId)
      : IoSecurity.requestDemoToken(cardId, scenario),
  open: (cardId, token) => IoSecurity.openSecureView(cardId, token),
  subscribe: listener => IoSecurity.onSecureEvent(listener),
};

export function securityMessage(event: SecureEvent): string {
  switch (event.type) {
    case 'onSecureViewOpened':
      return 'Abriendo sesión protegida';
    case 'onCardDataShown':
      return 'Datos visibles solo en la vista nativa';
    case 'onSecureViewClosed':
      return event.reason === 'TIMEOUT'
        ? 'Sesión cerrada por seguridad'
        : 'Tus datos vuelven a estar ocultos';
    case 'onValidationError':
      return event.code === 'TOKEN_EXPIRED'
        ? 'La sesión venció. Vuelve a intentarlo.'
        : 'No se pudo validar la sesión segura.';
    default:
      return '';
  }
}
