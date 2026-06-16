/**
 * Typed application errors. The error middleware maps `statusCode` + `code`
 * onto the HTTP response, so handlers can just `throw` and stay clean.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — bad input (invalid URL, out-of-range clicks, text too long, …). */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

/** 404 — advertiser / tournament not found. */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, 'NOT_FOUND');
  }
}

/** 402 — advertiser balance can't cover the campaign cost. */
export class InsufficientFundsError extends AppError {
  constructor(message = 'Insufficient balance to fund this campaign') {
    super(402, message, 'INSUFFICIENT_FUNDS');
  }
}
