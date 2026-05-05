import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error caught by global handler:', err);
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('unauthorized') || err.message.includes('Unauthorized')) {
    statusCode = 401;
    message = err.message;
  } else if (err.message.includes('forbidden') || err.message.includes('Forbidden')) {
    statusCode = 403;
    message = err.message;
  }

  const response: any = {
    success: false,
    message,
  };

  if (code) response.code = code;

  if (isDevelopment && err.stack) response.stack = err.stack;

  res.status(statusCode).json(response);
};