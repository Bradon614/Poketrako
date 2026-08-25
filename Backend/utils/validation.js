function isNonEmptyString(value, { maxLength = 255 } = {}) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPositiveNumber(value) {
  if (typeof value === 'boolean' || value === null || value === '') return false;
  const n = Number(value);
  return !Number.isNaN(n) && n > 0;
}

function isPositiveInteger(value) {
  if (typeof value === 'boolean' || value === null || value === '') return false;
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

function isValidDateString(value) {
  if (value === undefined || value === null || value === '') return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isPositiveNumber,
  isPositiveInteger,
  isValidDateString
};
