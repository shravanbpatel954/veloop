/**
 * The backend answers with stable error codes. The UI turns them into
 * friendly copy here, so raw API/DB errors never reach the screen.
 */
const FALLBACK = {
  title: 'Something went wrong',
  message: 'We could not complete that request. Please try again in a moment.',
};

export function describeError(error) {
  const code = error?.code;
  const copy = {
    LOGIN_REQUIRED: { title: 'Login required', message: 'Please log in to your VELOOP Rewards account to continue.' },
    GIVEAWAY_NOT_FOUND: { title: 'Giveaway not found', message: 'This giveaway is no longer available.' },
    GIVEAWAY_NOT_ACTIVE: { title: 'Giveaway is not open', message: 'This giveaway is not accepting entries right now.' },
    GIVEAWAY_ENDED: {
      title: 'This giveaway has ended',
      message: 'Check out the winners and get ready for the next giveaway.',
    },
    ALREADY_PARTICIPATING: {
      title: "You're already participating",
      message: 'You can participate again when a new giveaway event begins.',
    },
    INSUFFICIENT_VE_BALANCE: { title: 'Not enough VEs', message: shortfallText(error, 'VEs') },
    INSUFFICIENT_SVE_BALANCE: { title: 'Not enough SVEs', message: shortfallText(error, 'SVEs') },
    INSUFFICIENT_TOKEN_BALANCE: { title: 'Not enough Tokens', message: shortfallText(error, 'Tokens') },
    PARTICIPATION_BLOCKED: {
      title: "Participation couldn't be completed",
      message: 'We could not verify this participation request. Please try again later or contact support.',
    },
    SUSPICIOUS_ACTIVITY: {
      title: "Participation couldn't be completed",
      message: 'We could not verify this participation request. Please try again later or contact support if you believe this is an error.',
    },
    RATE_LIMITED: { title: 'Slow down a little', message: 'Too many attempts. Please wait a minute and try again.' },
    CLAIM_NOT_ALLOWED: { title: 'Claim not available', message: 'This prize cannot be claimed from your account.' },
    CLAIM_EXPIRED: { title: 'Claim window expired', message: 'The claim period for this prize has ended.' },
    VALIDATION_ERROR: { title: 'Please check your details', message: 'Some of the information provided is not valid.' },
    NETWORK_ERROR: { title: "Can't reach VELOOP", message: 'Check your connection and try again.' },
  };

  return copy[code] ?? FALLBACK;
}

function shortfallText(error, label) {
  const missing = error?.details?.shortfall;
  return missing ? `You need ${new Intl.NumberFormat('en-IN').format(missing)} more ${label} to join this giveaway.` : `You don't have enough ${label} to join this giveaway.`;
}
