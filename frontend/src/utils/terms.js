import { formatAmount } from './currency';
import { formatDateTime } from './format';

/**
 * Builds the Terms & Conditions and "Important information" content for a
 * prize from the giveaway record. Because it is data-driven, a new giveaway
 * with different fees or windows needs no component changes.
 */
export function buildTerms(giveaway, prize) {
  const { claimWindowDays, maxEntriesPerUser } = giveaway.participationSettings;
  const fee = formatAmount(prize.entry.amount, prize.entry.currency);

  return [
    { id: 'eligibility', title: 'Eligibility', body: giveaway.eligibility.join(' ') },
    { id: 'entry', title: 'Entry requirement', body: `Joining this draw costs exactly ${fee}. The amount is shown before you confirm and is deducted from your ${prize.entry.currency === 'TOKEN' ? 'Token' : prize.entry.currency} balance only.` },
    { id: 'participation', title: 'Participation', body: `You review the prize, check your balance and confirm. Each user can participate ${maxEntriesPerUser === 1 ? 'once' : `up to ${maxEntriesPerUser} times`} in this draw per giveaway event.` },
    { id: 'duration', title: 'Giveaway duration', body: `Starts ${formatDateTime(giveaway.startAt)} and ends ${formatDateTime(giveaway.endAt)}. The server clock decides when entries close.` },
    { id: 'selection', title: 'Winner selection', body: `${prize.winnerCount} ${prize.winnerCount === 1 ? 'winner is' : 'winners are'} selected at random by the VELOOP backend from valid participations after the giveaway ends.` },
    { id: 'announcement', title: 'Winner announcement', body: 'Winners are published on the Giveaway page shortly after the draw, with masked user IDs.' },
    { id: 'claim', title: 'Prize claim', body: `Winners see a claim option on the Giveaway page and submit only the details needed for fulfilment. ${prize.type === 'GIFT_CARD' ? 'Gift cards are sent by email.' : 'Physical prizes are delivered to the submitted address.'}` },
    { id: 'deadline', title: 'Claim deadline', body: `Winners have ${claimWindowDays} days from the announcement to submit their claim. Unclaimed prizes expire.` },
    { id: 'disqualification', title: 'Disqualification', body: 'Suspicious, fraudulent, abusive or rule-breaking activity may result in disqualification according to platform rules.' },
    { id: 'refund', title: 'Refund / entry policy', body: 'PLACEHOLDER: VELOOP has not finalised its refund policy for entry fees. This text must be confirmed before launch.', placeholder: true },
  ];
}

export function buildImportantInfo(giveaway, prize) {
  return [
    ['Entry currency', prize.entry.currency === 'TOKEN' ? 'Tokens' : `${prize.entry.currency}s`],
    ['Entry amount', formatAmount(prize.entry.amount, prize.entry.currency)],
    ['Giveaway duration', `${formatDateTime(giveaway.startAt)} to ${formatDateTime(giveaway.endAt)}`],
    ['Number of winners', String(prize.winnerCount)],
    ['Prize details', prize.name],
    ['Winner selection', 'Random draw on the server after the giveaway ends'],
    ['Claim requirements', `Submit details within ${giveaway.participationSettings.claimWindowDays} days`],
    ['Account eligibility', 'Verified account, 18+, India'],
    ['Fraud prevention', 'Duplicate and suspicious entries may be blocked'],
    ['Platform rules', 'VELOOP Rewards terms apply'],
  ];
}
