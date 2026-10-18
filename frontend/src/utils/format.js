export const formatDate = (iso, options = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-GB', options);

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const pad = (n) => String(n).padStart(2, '0');

/** Splits a millisecond duration into countdown parts. */
export function splitDuration(ms) {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    total,
  };
}

/** "12d" / "5h" / "9m" - the largest meaningful unit, for compact labels. */
export function shortRemaining(ms) {
  const { days, hours, minutes, total } = splitDuration(ms);
  if (total <= 0) return 'Ended';
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return `${Math.max(minutes, 1)}m left`;
}

export const twoDigits = pad;
