import { endpoint } from "../internal/api/endpoint.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../internal/api/errors.js";

import {
  AbortError,
  InvalidTokenError,
  MissingTokenError,
  NetworkError,
  UnexpectedError,
} from "./errors.js";

export type TokenPayload = {
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  amr: string[];
};

/**
 * Checks if the token is valid and returns its payload.
 * Important: make sure to verify the "aud" claim matches your own domain.
 * @param token the access token to verify
 * @param signal a way to abord the request (clientside) if needed
 * @returns the jwt's payload (if valid)
 * @throws {AbortError} when the authentication flow has been canceled (using signal)
 * @throws {MissingTokenError} if the token is not defined
 * @throws {NetworkError} when a connection error occured
 * @throws {InvalidTokenError} when the access token is malformed or expired
 * @throws {UnexpectedError} when an unexpected error occured
 */

export const verify = async (token: string, signal?: AbortSignal) => {
  try {
    if (!token) {
      throw new MissingTokenError();
    }
    const jwt = (await endpoint({
      method: "GET",
      ressource: `/tokens/${token}`,
      signal,
    })) as TokenPayload;

    return jwt;
  } catch (e: any) {
    if (e instanceof AbortError || e instanceof NetworkError || e instanceof MissingTokenError) {
      throw e;
    }

    if (
      e instanceof BadRequestError ||
      e instanceof NotFoundError ||
      e instanceof UnauthorizedError ||
      e instanceof ForbiddenError
    ) {
      throw new InvalidTokenError();
    }

    throw new UnexpectedError(e);
  }
};

export const getPayload = function (token: string) {
  const jwtParts = token.split(".");

  if (jwtParts.length !== 3) {
    throw new InvalidTokenError();
  }
  const payload64 = jwtParts[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(payload64)) as TokenPayload;
};
