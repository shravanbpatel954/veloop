/**
 * Decides what the user is allowed to do next. Keeping this in one place means
 * the hero, prize cards and details page never disagree with each other.
 */

export const hasJoinedPrize = (myStatus, prizeId) =>
  Boolean(myStatus?.participations?.some((item) => item.prizeId === prizeId));

export const getWinning = (myStatus, prizeId) => myStatus?.winnings?.find((item) => item.prizeId === prizeId) ?? null;

/** visitor | member | participant | winner | non-winner */
export function getUserState({ user, myStatus, giveaway }) {
  if (!user) return 'visitor';
  const announced = giveaway?.winnersStatus === 'ANNOUNCED';
  if (announced && myStatus?.winnings?.length) return 'winner';
  const participated = (myStatus?.participations?.length ?? 0) > 0;
  if (announced && participated) return 'non-winner';
  return participated ? 'participant' : 'member';
}

/**
 * Primary action for the whole giveaway (hero + banner).
 * kind is consumed by <ActionButton /> to pick a link, a scroll target or a toggle.
 */
export function getGiveawayAction({ giveaway, userState }) {
  if (!giveaway) return { kind: 'none', label: 'Explore Rewards' };

  switch (giveaway.status) {
    case 'UPCOMING':
      return { kind: 'notify', label: 'Notify Me' };
    case 'ENDED':
      return { kind: 'scroll', target: 'winners', label: 'View Winners' };
    default:
      break;
  }

  switch (userState) {
    case 'visitor':
      return { kind: 'link', to: '/login', label: 'Login to Participate' };
    case 'participant':
      return { kind: 'scroll', target: 'how-it-works', label: 'Earn More Entries', variant: 'secondary' };
    default:
      return { kind: 'scroll', target: 'prizes', label: 'Join Giveaway' };
  }
}

/** Action on the individual prize page, driven by balance and join state. */
export function getPrizeAction({ giveaway, user, joined, balance }) {
  if (giveaway.status === 'UPCOMING') return { kind: 'notify', label: 'Notify Me' };
  if (giveaway.status === 'ENDED') return { kind: 'winners', label: 'View Winners' };
  if (!user) return { kind: 'login', label: 'Login to Participate' };
  if (joined) return { kind: 'joined', label: "You're Participating", disabled: true };
  if (!balance.hasEnough) return { kind: 'earn', label: 'Earn More' };
  return { kind: 'join', label: 'Join Giveaway' };
}
