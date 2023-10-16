export class NoPwdError extends Error {
  constructor(message: string) {
    super(`nopwd - ${message}`);
  }
}

export class AbortError extends NoPwdError {
  constructor() {
    super("canceled");
  }
}

export class NetworkError extends NoPwdError {
  constructor() {
    super("no network");
  }
}

export class ApiError extends NoPwdError {
  private status: number;
  private data: any;

  constructor(status: number, data: any) {
    super(`api - status=${status} - ${data.error}`);
    this.status = status;
    this.data = data;
  }

  getData() {
    return this.data;
  }

  getStatus() {
    return this.status;
  }
}

export class BadRequestError extends ApiError {
  constructor(data: any) {
    super(400, data);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(data: any) {
    super(401, data);
  }
}

export class ForbiddenError extends ApiError {
  constructor(data: any) {
    super(403, data);
  }
}

export class NotFoundError extends ApiError {
  constructor(data: any) {
    super(404, data);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(data: any) {
    super(429, data);
  }

  getRetryAt(): number {
    return this.getData().retry_at ? this.getData().retry_at : 0;
  }
}

export class InternalError extends ApiError {
  constructor(data: any) {
    super(500, data);
  }
}
