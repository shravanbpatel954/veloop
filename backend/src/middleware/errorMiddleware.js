import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const notFound = (_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });

/** One place that shapes every error. Internal details (stack, Mongo messages) never leave the server. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'VALIDATION_ERROR', message: 'Request too large' } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON' } });
  }

  console.error(`[${req.requestId ?? '-'}]`, err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', ...(env.isProduction ? {} : { debug: err?.message }) },
  });
}
