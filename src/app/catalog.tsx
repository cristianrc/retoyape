import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Account, Card } from '../features/products/domain';
import type { Benefit } from '../features/benefits/domain';
import cards from '../features/products/cards.json';
import benefits from '../features/benefits/benefits.json';

export type Catalog = {
  accounts: Account[];
  cards: Card[];
  benefits: Benefit[];
};
export type CatalogRepository = { load(): Promise<Catalog> };
export const mockCatalogRepository: CatalogRepository = {
  async load() {
    return {
      accounts: [
        {
          id: 'acc_101',
          alias: 'Cuenta de ahorros',
          maskedNumber: '•••• 0101',
          balance: 4280.5,
          currency: 'PEN',
        },
      ],
      cards: cards as Card[],
      benefits: benefits as Benefit[],
    };
  },
};

type State =
  | { status: 'loading'; data: null }
  | { status: 'error'; data: null }
  | { status: 'ready'; data: Catalog };
const CatalogContext = createContext<(State & { reload(): void }) | null>(null);

export function CatalogProvider({
  children,
  repository = mockCatalogRepository,
}: {
  children: React.ReactNode;
  repository?: CatalogRepository;
}) {
  const [state, setState] = useState<State>({ status: 'loading', data: null });
  const generation = useRef(0);
  const reload = useCallback(() => {
    const current = ++generation.current;
    setState({ status: 'loading', data: null });
    repository.load().then(
      data => {
        if (current === generation.current) setState({ status: 'ready', data });
      },
      () => {
        if (current === generation.current)
          setState({ status: 'error', data: null });
      },
    );
  }, [repository]);
  useEffect(() => {
    reload();
    const pending = generation;
    return () => {
      pending.current++;
    };
  }, [reload]);
  return (
    <CatalogContext.Provider value={{ ...state, reload }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('CatalogProvider es obligatorio');
  return value;
}
