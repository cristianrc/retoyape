import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  CatalogProvider,
  mockCatalogRepository,
  type CatalogRepository,
} from '../src/app/catalog';
import { ProductsScreen } from '../src/features/products/ProductsScreen';
import { BenefitsScreen } from '../src/features/benefits/BenefitsScreen';
import { IoSecurity } from '@io/native';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CatalogProvider>{children}</CatalogProvider>
);

afterEach(() => {
  jest.clearAllMocks();
});

test('products show masked values and request native secure view', async () => {
  const screen = await render(<ProductsScreen />, { wrapper });
  expect(await screen.findByLabelText('**** **** **** 1234')).toBeTruthy();
  expect(screen.getByLabelText('Vence 12/28')).toBeTruthy();
  expect(screen.getByText('Cuenta de ahorros')).toBeTruthy();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver datos sensibles · VISA' }),
  );
  await waitFor(() =>
    expect(IoSecurity.openSecureView).toHaveBeenCalledWith(
      'card_001',
      'opaque-test-token',
    ),
  );
  expect(IoSecurity.requestMockSecureToken).toHaveBeenCalledWith('card_001');
  expect(
    screen.getByRole('button', { name: 'Ver datos sensibles · VISA' }),
  ).toBeDisabled();
});

test('loading, failure and retry recover the catalog', async () => {
  const data = await mockCatalogRepository.load();
  const load = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(data);
  const screen = await render(
    <CatalogProvider repository={{ load }}>
      <ProductsScreen />
    </CatalogProvider>,
  );
  await fireEvent.press(
    await screen.findByRole('button', { name: 'Volver a intentar' }),
  );
  expect(await screen.findByText('Cuenta de ahorros')).toBeTruthy();
  expect(load).toHaveBeenCalledTimes(2);
});

test('empty products and benefits show their empty states', async () => {
  const repository: CatalogRepository = {
    load: async () => ({ cards: [], accounts: [], benefits: [] }),
  };
  const screen = await render(
    <CatalogProvider repository={repository}>
      <ProductsScreen />
      <BenefitsScreen />
    </CatalogProvider>,
  );
  expect(await screen.findByText('Aún no tienes tarjetas')).toBeTruthy();
  expect(screen.getByText('Aún no tienes cuentas')).toBeTruthy();
  expect(screen.getByText('Pronto tendrás nuevos beneficios')).toBeTruthy();
});

test('map and carousel share selection and ignore unknown markers', async () => {
  const screen = await render(<BenefitsScreen />, { wrapper });
  await screen.findByText('Café de barrio');
  const map = () => screen.getByTestId('benefits-map');
  expect(map().props.selectedMarkerId).toBe('1');
  await fireEvent(map(), 'markerPress', { nativeEvent: { markerId: '2' } });
  expect(map().props.selectedMarkerId).toBe('2');
  await fireEvent(map(), 'markerPress', {
    nativeEvent: { markerId: 'missing' },
  });
  expect(map().props.selectedMarkerId).toBe('2');
  await fireEvent.press(screen.getByRole('button', { name: /^Cineplanet,/ }));
  expect(map().props.selectedMarkerId).toBe('3');
  expect(screen.getByRole('button', { name: /^Cineplanet,/ })).toBeSelected();
  const carousel = screen.getByTestId('benefits-carousel');
  await fireEvent(carousel, 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: 0 } },
  });
  expect(map().props.selectedMarkerId).toBe('1');
  await fireEvent(carousel, 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { x: -999 } },
  });
  expect(map().props.selectedMarkerId).toBe('1');
  await fireEvent(map(), 'mapReady', { nativeEvent: { ready: true } });
  expect(screen.queryByText('Preparando el mapa…')).toBeNull();
});

test('map can be retried when initialization takes too long', async () => {
  jest.useFakeTimers();
  const screen = await render(<BenefitsScreen />, { wrapper });
  await act(async () => {});
  await act(() => jest.advanceTimersByTime(12000));
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  expect(screen.getByText('Preparando el mapa…')).toBeTruthy();
  await screen.unmount();
  jest.useRealTimers();
});

test('map configuration errors leave the benefits available', async () => {
  const screen = await render(<BenefitsScreen />, { wrapper });
  await screen.findByText('Café de barrio');
  await fireEvent(screen.getByTestId('benefits-map'), 'mapError', {
    nativeEvent: { code: 'MAPS_NOT_CONFIGURED' },
  });
  expect(
    screen.getByText(
      'Mapa no disponible. Puedes explorar los beneficios abajo.',
    ),
  ).toBeTruthy();
});

test('balance can be hidden and revealed without changing the account', async () => {
  const screen = await render(<ProductsScreen />, { wrapper });
  expect(screen.getByText('S/ 4,280.50')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ocultar saldo' }));
  expect(screen.queryByText('S/ 4,280.50')).toBeNull();
  expect(screen.getByText('S/ ••••••')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Mostrar saldo' }));
  expect(screen.getByText('S/ 4,280.50')).toBeTruthy();
});

test('benefit search and categories filter the same markers and carousel', async () => {
  const { Alert } = require('react-native');
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = await render(<BenefitsScreen />, { wrapper });
  await fireEvent.changeText(
    screen.getByLabelText('Buscar beneficios'),
    'cafe',
  );
  expect(
    screen
      .getByTestId('benefits-map')
      .props.markers.map((item: { id: string }) => item.id),
  ).toEqual(['1']);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Filtrar: Restaurantes' }),
  );
  expect(screen.getByText('No encontramos beneficios')).toBeTruthy();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Volver a intentar' }),
  );
  expect(screen.getByTestId('benefits-map').props.markers).toHaveLength(3);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Filtrar: Restaurantes' }),
  );
  expect(screen.getByTestId('benefits-map').props.selectedMarkerId).toBe('2');
  await fireEvent.press(
    screen.getByRole('button', {
      name: 'Centrar mapa en todos los beneficios',
    }),
  );
  expect(screen.getByTestId('benefits-map').props.cameraResetKey).toBe(1);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver beneficio de Mesa compartida' }),
  );
  expect(alert).toHaveBeenCalledWith(
    'Mesa compartida',
    expect.stringContaining('no canjeable'),
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ocultar categorías' }),
  );
  expect(
    screen.queryByRole('button', { name: 'Filtrar: Restaurantes' }),
  ).toBeNull();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Mostrar categorías' }),
  );
  expect(
    screen.getByRole('button', { name: 'Filtrar: Restaurantes' }),
  ).toBeTruthy();
  alert.mockRestore();
});
