export class ApiError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static isUnauthorized(error: unknown): boolean {
    return ApiError.isApiError(error) && error.statusCode === 401;
  }

  static isNotFound(error: unknown): boolean {
    return ApiError.isApiError(error) && error.statusCode === 404;
  }

  static isValidationError(error: unknown): boolean {
    return ApiError.isApiError(error) && error.statusCode === 422;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}
