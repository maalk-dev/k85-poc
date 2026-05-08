export type ApplicationErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'INSUFFICIENT_STOCK';

export class ApplicationError extends Error {
  public readonly code: ApplicationErrorCode;

  public constructor(code: ApplicationErrorCode, message: string) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
  }
}

export function notFound(message: string): ApplicationError {
  return new ApplicationError('NOT_FOUND', message);
}

export function insufficientStock(message: string): ApplicationError {
  return new ApplicationError('INSUFFICIENT_STOCK', message);
}
