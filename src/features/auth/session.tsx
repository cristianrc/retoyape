import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  firebaseAuthentication,
  type Authentication,
  type SessionUser,
} from './authentication';

type SessionState =
  | { status: 'initializing'; user: null }
  | { status: 'signedOut'; user: null }
  | { status: 'signedIn'; user: SessionUser };
type Session = SessionState & Pick<Authentication, 'signIn' | 'signOut'>;
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  children,
  authentication = firebaseAuthentication,
}: {
  children: React.ReactNode;
  authentication?: Authentication;
}) {
  const [state, setState] = useState<SessionState>({
    status: 'initializing',
    user: null,
  });
  useEffect(
    () =>
      authentication.observe(user =>
        setState(
          user ? { status: 'signedIn', user } : { status: 'signedOut', user },
        ),
      ),
    [authentication],
  );
  return (
    <SessionContext.Provider
      value={{
        ...state,
        signIn: authentication.signIn,
        signOut: authentication.signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
