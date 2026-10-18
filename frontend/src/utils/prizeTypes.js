/**
 * Single place that knows how each prize type behaves.
 * Components ask this module what to render instead of branching on prize names.
 */
export const PRIZE_TYPES = {
  PHYSICAL: {
    label: 'Physical prize',
    claimForm: 'address',
    claimTitle: 'Claim Your Prize',
    requiredInfo: ['Full name', 'Phone number', 'Delivery address', 'City, state and PIN code'],
    claimNote: 'Only the details needed to deliver your prize are collected.',
    deliveryInfo: 'Delivered to the address you submit after the claim is verified.',
  },
  GIFT_CARD: {
    label: 'Gift card',
    claimForm: 'email',
    claimTitle: 'Claim Gift Card',
    requiredInfo: ['Email address'],
    claimNote: 'No delivery address is needed for gift cards.',
    deliveryInfo: 'Sent by email to the address you submit after the claim is verified.',
  },
  DIGITAL: {
    label: 'Digital reward',
    claimForm: 'email',
    claimTitle: 'Claim Reward',
    requiredInfo: ['Email address'],
    claimNote: 'Digital rewards are delivered electronically.',
    deliveryInfo: 'Delivered electronically after the claim is verified.',
  },
};

export const getPrizeType = (prize) => PRIZE_TYPES[prize?.type] ?? PRIZE_TYPES.PHYSICAL;

export const CLAIM_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
};
