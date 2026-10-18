/** Lets async controllers throw; Express 4 needs the rejection forwarded to next(). */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
