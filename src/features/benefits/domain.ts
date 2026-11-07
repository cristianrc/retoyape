import type { Brand, Card } from '../products/domain';

export type Benefit = {
  id: string;
  title: string;
  description: string;
  promotion: string;
  address: string;
  latitude: number;
  longitude: number;
  applicableBrands: Brand[];
  category: string;
  color: string;
};

export function eligibleBenefits(
  benefits: Benefit[],
  cards: Card[],
): Benefit[] {
  const brands = new Set(cards.map(card => card.brand));
  return benefits.filter(benefit =>
    benefit.applicableBrands.some(brand => brands.has(brand)),
  );
}

export type BenefitMarker = Pick<
  Benefit,
  'id' | 'title' | 'latitude' | 'longitude'
>;

export function toMarkers(benefits: Benefit[]): BenefitMarker[] {
  return benefits
    .filter(
      item =>
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude) &&
        Math.abs(item.latitude) <= 90 &&
        Math.abs(item.longitude) <= 180,
    )
    .map(({ id, title, latitude, longitude }) => ({
      id,
      title,
      latitude,
      longitude,
    }));
}

export function resolveSelection(
  benefits: Benefit[],
  candidate: string,
): string {
  return benefits.some(benefit => benefit.id === candidate)
    ? candidate
    : benefits[0]?.id ?? '';
}

export function filterBenefits(
  benefits: Benefit[],
  query: string,
  category: string,
): Benefit[] {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const term = normalize(query.trim());
  return benefits.filter(
    item =>
      (category === 'TODOS' || item.category === category) &&
      normalize(`${item.title} ${item.description} ${item.category}`).includes(
        term,
      ),
  );
}
