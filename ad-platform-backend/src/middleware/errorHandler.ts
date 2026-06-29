import type { ErrorRequestHandler } from 'express';

import { AppError } from '../errors';

/**
 * Central error middleware. Typed AppErrors map straight to their statusCode +
 * code; anything else is an unexpected failure → 500 with the detail hidden.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Unknown / programmer error — log the real thing, return a safe message.
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};
