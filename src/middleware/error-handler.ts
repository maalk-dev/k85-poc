import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApplicationError, type ApplicationErrorCode } from '../lib/application-error.ts';
import type { ErrorResponse } from '../schemas/order-schemas.ts';

const statusByApplicationCode: Record<ApplicationErrorCode, number> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
};

type HttpParserError = Error & {
  status?: number;
  type?: string;
};

function formatValidationMessage(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join('.');

      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join('; ');
}

function isMalformedJsonError(error: unknown): error is HttpParserError {
  return error instanceof SyntaxError && typeof error === 'object' && error !== null && 'status' in error;
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    const body: ErrorResponse = {
      error: 'BAD_REQUEST',
      message: formatValidationMessage(error),
    };

    response.status(400).json(body);
    return;
  }

  if (error instanceof ApplicationError) {
    const body: ErrorResponse = {
      error: error.code,
      message: error.message,
    };

    response.status(statusByApplicationCode[error.code]).json(body);
    return;
  }

  if (isMalformedJsonError(error) && error.status === 400) {
    const body: ErrorResponse = {
      error: 'BAD_REQUEST',
      message: 'Malformed request body',
    };

    response.status(400).json(body);
    return;
  }

  const body: ErrorResponse = {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected internal server error',
  };

  response.status(500).json(body);
};
