/** Stable error codes the frontend maps to friendly messages. */
export const ERROR_STATUS = {
  LOGIN_REQUIRED: 401,
  FORBIDDEN: 403,
  GIVEAWAY_NOT_FOUND: 404,
  PRIZE_NOT_FOUND: 404,
  GIVEAWAY_NOT_ACTIVE: 409,
  GIVEAWAY_ENDED: 409,
  ALREADY_PARTICIPATING: 409,
  INSUFFICIENT_VE_BALANCE: 402,
  INSUFFICIENT_SVE_BALANCE: 402,
  INSUFFICIENT_TOKEN_BALANCE: 402,
  PARTICIPATION_BLOCKED: 403,
  SUSPICIOUS_ACTIVITY: 403,
  RATE_LIMITED: 429,
  CLAIM_NOT_ALLOWED: 403,
  CLAIM_EXPIRED: 410,
  VALIDATION_ERROR: 400,
  INVALID_CREDENTIALS: 401,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  constructor(code, message, details) {
    super(message ?? code);
    this.code = code;
    this.status = ERROR_STATUS[code] ?? 400;
    this.details = details;
  }
}

export const insufficientBalanceCode = (currency) => `INSUFFICIENT_${currency}_BALANCE`;
