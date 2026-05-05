export class AppError extends Error {
  public statusCode: number;
  public code?: string | undefined;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}