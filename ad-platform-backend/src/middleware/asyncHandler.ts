import type { RequestHandler } from 'express';

/**
 * Wraps an async route handler so any rejected promise is forwarded to Express's
 * error middleware instead of crashing the process with an unhandled rejection.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
