import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type SecureEvent = {
  type: string;
  cardId: string;
  code: string;
  reason: string;
};

export interface Spec extends TurboModule {
  requestMockSecureToken(cardId: string): Promise<string>;
  requestDemoToken(cardId: string, scenario: string): Promise<string>;
  openSecureView(cardId: string, secureToken: string): Promise<void>;
  readonly onSecureEvent: CodegenTypes.EventEmitter<SecureEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IoSecurity');
