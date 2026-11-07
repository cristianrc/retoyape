import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../shared/theme';
import { Feedback } from '../../shared/ui';
import { LoginScreen } from './LoginScreen';
import { useSession } from './session';

export function SessionGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  if (!session) throw new Error('SessionProvider es obligatorio');
  if (session.status === 'initializing') {
    return (
      <SafeAreaView style={styles.loading}>
        <Feedback loading title="Preparando tu sesión…" />
      </SafeAreaView>
    );
  }
  return session.status === 'signedIn' ? (
    children
  ) : (
    <LoginScreen signIn={session.signIn} />
  );
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
