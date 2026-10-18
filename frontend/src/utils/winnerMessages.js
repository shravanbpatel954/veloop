/**
 * Builds the ticker messages from winner records the backend has published
 * (current giveaway + previous ones). Nothing is invented here.
 */
export function buildWinnerMessages({ currentWinners = [], previous = [] }) {
  const current = currentWinners.map((winner) => ({
    id: `cur-${winner.id}`,
    displayId: winner.displayId,
    prizeLabel: withArticle(winner.prizeName),
    context: 'This giveaway',
  }));

  const earlier = previous.flatMap((giveaway) =>
    giveaway.winners.map((winner) => ({
      id: `prev-${giveaway.id}-${winner.displayId}-${winner.prizeName}`,
      displayId: winner.displayId,
      prizeLabel: withArticle(winner.prizeName),
      context: giveaway.title,
    })),
  );

  // Show the headline prizes first, then the rest, without repeating a prize back-to-back.
  const rank = (message) => (/iPhone/.test(message.prizeLabel) ? 0 : /Watch/.test(message.prizeLabel) ? 1 : /AirPods/.test(message.prizeLabel) ? 2 : 3);
  return [...current.slice(0, 6), ...earlier].sort((a, b) => rank(a) - rank(b)).slice(0, 10);
}

const withArticle = (name) => (/^[aeiou]/i.test(name) ? `an ${name}` : `a ${name}`);
