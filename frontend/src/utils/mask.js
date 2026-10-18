/** "VE10025" -> "VE****25". Winners are never shown with their full ID. */
export function maskUserId(userId = '') {
  if (userId.length < 5) return '****';
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}
