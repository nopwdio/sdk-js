import { NoPwdError } from "../internal/api/errors.js";

export { NetworkError, AbortError, NoPwdError } from "../internal/api/errors.js";

export class MissingEmailError extends NoPwdError {
  constructor() {
    super("missing email");
  }
}

export class InvalidEmailError extends NoPwdError {
  constructor() {
    super("invalid email");
  }
}

export class WebauthnNotSupportedError extends NoPwdError {
  constructor() {
    super("webauthn is not supported");
  }
}

export class UnknownChallengeOrPasskeyError extends NoPwdError {
  constructor() {
    super("unknown challenge or passkey");
  }
}

export class InvalidSignatureError extends NoPwdError {
  constructor() {
    super("invalid signature");
  }
}

export class MissingCodeParameterError extends NoPwdError {
  constructor() {
    super("missing code parameter (test its presence using 'hasCallbackCode' before)");
  }
}

export class InvalidCodeParameterError extends NoPwdError {
  constructor() {
    super("Invalid code parameter (malformed or expired)");
  }
}

export class MissingTokenError extends NoPwdError {
  constructor() {
    super("missing token");
  }
}

export class InvalidTokenError extends NoPwdError {
  constructor() {
    super("invalid token");
  }
}

export class QuotaError extends NoPwdError {
  private retryAt: number;

  constructor(retryAt: number) {
    super(`wait ${Math.round(retryAt - Date.now() / 1000)} second(s) and try again`);
    this.retryAt = retryAt;
  }

  getRetryAt() {
    return this.retryAt;
  }
}

export class UnknownPasskeyError extends NoPwdError {
  constructor() {
    super("unknown passkey");
  }
}

export class UnexpectedError extends NoPwdError {
  constructor(e: Error) {
    super(e.message);
  }
}
