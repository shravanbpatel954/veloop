import { AppError } from '../utils/errors.js';

/** Validates req.body with a zod schema and replaces it with the cleaned result (unknown keys dropped). */
export const validateBody = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return next(new AppError('VALIDATION_ERROR', 'Invalid request', parsed.error.flatten().fieldErrors));
  }
  req.body = parsed.data;
  return next();
};
