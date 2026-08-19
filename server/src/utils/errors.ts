export class IngestionError extends Error {
  constructor(message: string, public readonly isTransient: boolean = false) {
    super(message);
    this.name = 'IngestionError';
  }
}

export class TransientError extends IngestionError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, true);
    this.name = 'TransientError';
  }
}

export class PermanentError extends IngestionError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, false);
    this.name = 'PermanentError';
  }
}

export class RateLimitError extends IngestionError {
  constructor(message: string, public readonly retryAfterMs: number = 5000) {
    super(message, true);
    this.name = 'RateLimitError';
  }
}

export class MalformedResponseError extends IngestionError {
  constructor(message: string) {
    super(message, false);
    this.name = 'MalformedResponseError';
  }
}

export class ValidationError extends IngestionError {
  constructor(message: string) {
    super(message, false);
    this.name = 'ValidationError';
  }
}
