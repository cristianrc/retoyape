export type Brand = 'VISA' | 'MASTERCARD';

export type Card = {
  cardId: string;
  alias: string;
  maskedPan: string;
  brand: Brand;
  expiry: string;
  accountId: string;
};

export type Account = {
  id: string;
  alias: string;
  maskedNumber: string;
  balance: number;
  currency: 'PEN';
};

export function displayExpiry(expiry: string): string {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) ? expiry : '--/--';
}

export function displayPan(maskedPan: string): string {
  const lastFour = maskedPan.replace(/\D/g, '').slice(-4);
  return `**** **** **** ${lastFour.length === 4 ? lastFour : '****'}`;
}

export function formatBalance(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
