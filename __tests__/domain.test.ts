import {
  displayExpiry,
  displayPan,
  formatBalance,
} from '../src/features/products/domain';
import {
  eligibleBenefits,
  resolveSelection,
  toMarkers,
} from '../src/features/benefits/domain';
import { mockCatalogRepository } from '../src/app/catalog';

test('formats masked values defensively', () => {
  expect(displayPan('**** **** **** 1234')).toBe('**** **** **** 1234');
  expect(displayPan('')).toBe('**** **** **** ****');
  expect(displayExpiry('12/28')).toBe('12/28');
  expect(displayExpiry('13/28')).toBe('--/--');
  expect(formatBalance(4280.5)).toBe('S/ 4,280.50');
});

test('eligibility uses the cards owned by the user', async () => {
  const { cards, benefits } = await mockCatalogRepository.load();
  expect(
    eligibleBenefits(benefits, cards.slice(0, 1)).map(item => item.id),
  ).toEqual(['1', '2']);
  expect(eligibleBenefits(benefits, []).length).toBe(0);
  expect(eligibleBenefits(benefits, cards)).toHaveLength(3);
});

test('marker conversion and selection tolerate missing and malformed data', async () => {
  const { benefits } = await mockCatalogRepository.load();
  expect(toMarkers([])).toEqual([]);
  expect(
    toMarkers([
      { ...benefits[0], latitude: NaN },
      { ...benefits[0], longitude: 181 },
    ]),
  ).toEqual([]);
  expect(toMarkers(benefits)[0]).toEqual({
    id: '1',
    title: 'Café de barrio',
    latitude: -12.1234,
    longitude: -77.0301,
  });
  expect(resolveSelection(benefits, '2')).toBe('2');
  expect(resolveSelection(benefits, 'missing')).toBe('1');
  expect(resolveSelection([], 'missing')).toBe('');
});

test('catalog contains only public card fields and masked PANs', async () => {
  const { cards } = await mockCatalogRepository.load();
  for (const card of cards) {
    expect(Object.keys(card)).not.toEqual(
      expect.arrayContaining(['pan', 'cvv', 'holder']),
    );
    expect(card.maskedPan).toMatch(/^\*{4} \*{4} \*{4} \d{4}$/);
    expect(
      Object.keys(card).some(key => ['pan', 'cvv', 'holder'].includes(key)),
    ).toBe(false);
  }
});
