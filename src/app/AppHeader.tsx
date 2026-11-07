import React from 'react';
import { Alert } from 'react-native';
import { authenticationMessage } from '../features/auth/authentication';
import { useSession } from '../features/auth/session';
import { BrandBar } from '../shared/ui';

export function AppHeader() {
  const session = useSession();

  function confirmSignOut() {
    Alert.alert('Cerrar sesión', '¿Quieres salir de Reto Yape?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        onPress: () => {
          session
            ?.signOut()
            .catch(error =>
              Alert.alert(
                'No pudimos cerrar la sesión',
                authenticationMessage(error),
              ),
            );
        },
      },
    ]);
  }

  return (
    <BrandBar
      onSignOut={session?.status === 'signedIn' ? confirmSignOut : undefined}
    />
  );
}
