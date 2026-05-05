interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  stack?: string;
}

export const createSuccessResponse = <T = any>(
  data: T,
  message?: string,
  meta?: Record<string, any>
): ApiResponse<T> => ({
  success: true,
  ...(message && { message }),
  data,
  ...(meta && { meta }),
});

export const createErrorResponse = (
  message: string,
  code?: string,
  stack?: string
): ApiErrorResponse => ({
  success: false,
  message,
  ...(code && { code }),
  ...(stack && { stack }),
});