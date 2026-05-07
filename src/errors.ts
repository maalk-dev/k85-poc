export type ErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'INTERNAL_SERVER_ERROR';

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorBody(error: ErrorCode, message: string) {
  return { error, message };
}
