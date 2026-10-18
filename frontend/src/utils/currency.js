/**
 * Entry-fee currencies used by the giveaway system.
 * The codes match what the backend stores on each prize (entry.currency).
 */
export const CURRENCIES = {
  VE: { code: 'VE', short: 'VEs', name: 'VEs', earnPath: '/giveaway#how-it-works' },
  SVE: { code: 'SVE', short: 'SVEs', name: 'SVEs', earnPath: '/giveaway#how-it-works' },
  TOKEN: { code: 'TOKEN', short: 'Tokens', name: 'Tokens', earnPath: '/giveaway#how-it-works' },
};

export const getCurrency = (code) => CURRENCIES[code] ?? { code, short: code, name: code, earnPath: '/giveaway' };

export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);

/** 250, 'VE' -> "250 VEs" */
export const formatAmount = (amount, currencyCode) =>
  `${formatNumber(amount)} ${getCurrency(currencyCode).short}`;

/** 2300 -> "2.3K+" (used for social-proof counters) */
export const formatCompact = (value) => {
  if (value < 1000) return String(value);
  const compact = (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, '');
  return `${compact}K+`;
};

/**
 * Compares the user's balance in the *correct* currency with the entry fee.
 * This is display logic only; the backend re-checks everything on join.
 */
export function checkBalance(balances, entry) {
  const balance = balances?.[entry.currency] ?? 0;
  const shortfall = Math.max(entry.amount - balance, 0);
  return {
    balance,
    fee: entry.amount,
    hasEnough: balance >= entry.amount,
    shortfall,
    balanceAfter: balance - entry.amount,
  };
}
