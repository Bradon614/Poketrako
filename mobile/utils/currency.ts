const CURRENCY_SYMBOLS: Record<string, string> = {
  MGA: 'Ar',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

const CURRENCY_LOCALES: Record<string, string> = {
  MGA: 'mg-MG',
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB',
};

export function formatMoney(amount: number, currency: string = 'MGA'): string {
  const locale = CURRENCY_LOCALES[currency] || 'fr-FR';
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'MGA' ? 0 : 2,
      maximumFractionDigits: currency === 'MGA' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${symbol}`;
  }
}

export function parseMoney(value: string, currency: string = 'MGA'): number {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const cleaned = value.replace(new RegExp(`[^0-9.,${symbol}]`, 'g'), '').replace(symbol, '');
  const normalized = cleaned.replace(/\s/g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
}