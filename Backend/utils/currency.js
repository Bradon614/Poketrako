const LOCALE_BY_CURRENCY = {
  MGA: 'fr-MG',
  EUR: 'fr-FR',
  USD: 'en-US',
  GBP: 'en-GB'
};

// Ariary has no practical decimal subdivision in everyday use, unlike the
// others — formatting it with cents would be misleading.
const FRACTION_DIGITS_BY_CURRENCY = { MGA: 0 };

function formatMoney(amount, currency = 'MGA') {
  const value = Number(amount) || 0;
  const locale = LOCALE_BY_CURRENCY[currency] || 'fr-FR';
  const maximumFractionDigits = FRACTION_DIGITS_BY_CURRENCY[currency] ?? 2;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits
    }).format(value);
  } catch {
    return `${value.toFixed(maximumFractionDigits)} ${currency}`;
  }
}

module.exports = { formatMoney };
