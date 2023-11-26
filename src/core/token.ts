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
 * Checks if the token is valid.
 * Important: make sure to verify the "aud" claim matches your domain.
 * @returns the jwt payload.
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

/**
 * Revokes an access token.
 * All subsequent 'verify' calls will returns an error
 */
export const revoke = async (token: string, signal?: AbortSignal) => {
  try {
    if (!token) {
      throw new MissingTokenError();
    }

    await endpoint({
      method: "DELETE",
      ressource: `/tokens/${token}`,
      signal,
    });
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
