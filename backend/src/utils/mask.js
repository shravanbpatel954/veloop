/** "VE10025" -> "VE****25". Public APIs only ever return this form. */
export function maskUserId(userId = '') {
  if (userId.length < 5) return '****';
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}
