/**
 * The server clock is the single authority on lifecycle.
 * Stored status only matters for ARCHIVED (set explicitly by an admin/job);
 * everything else is derived from startAt / endAt.
 */
export function effectiveStatus(giveaway, now = new Date()) {
  if (giveaway.status === 'ARCHIVED') return 'ARCHIVED';
  if (now < giveaway.startAt) return 'UPCOMING';
  if (now <= giveaway.endAt) return 'ACTIVE';
  return 'ENDED';
}

/** PENDING (not ended) -> SELECTING (ended, no draw yet) -> ANNOUNCED. */
export function winnersStatus(giveaway, status) {
  if (status === 'UPCOMING' || status === 'ACTIVE') return 'PENDING';
  return giveaway.winnersAnnouncedAt ? 'ANNOUNCED' : 'SELECTING';
}
