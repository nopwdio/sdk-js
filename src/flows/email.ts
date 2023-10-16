import { endpoint } from "../internal/api/endpoint.js";
import {
  BadRequestError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../internal/api/errors.js";
import { generateRandomString } from "../internal/crypto/random.js";
import {
  InvalidEmailError,
  MissingCodeParameterError,
  MissingEmailError,
  QuotaError,
  UnexpectedError,
  NetworkError,
  AbortError,
  InvalidCodeParameterError,
} from "./errors.js";

/**
 * Starts a magic link authentification
 *
 * @param params the authentication request parameters
 * @param params.email the user's email to authenticate
 * @param signal a way to abord the request (clientside) if needed
 * @returns the request expiration date (posix)
 * @throws {AbortError} when the authentication flow has been canceled (using signal)
 * @throws {MissingEmailError} when the email parameter is missing
 * @throws {InvalidEmailError} when the email parameter is malformed
 * @throws {QuotaError} when too many auth attempts have been made
 * @throws {UnexpectedError} when an unexpected error occured
 */
export const request = async (
  params: {
    email: string;
    pkce?: boolean;
  },
  signal?: AbortSignal
) => {
  try {
    if (params.email.length === 0) {
      throw new MissingEmailError();
    }

    const { expires_at } = (await endpoint({
      method: "POST",
      ressource: "/email/requests",
      data: {
        email: params.email,
        callback_uri: location.href,
      },
      signal: signal,
    })) as {
      expires_at: number;
    };

    return expires_at;
  } catch (e: any) {
    if (e instanceof AbortError || e instanceof NetworkError || e instanceof MissingEmailError) {
      throw e;
    }

    if (e instanceof BadRequestError) {
      throw new InvalidEmailError();
    }

    if (e instanceof TooManyRequestsError) {
      throw new QuotaError(e.getRetryAt());
    }

    throw new UnexpectedError(e);
  }
};

/**
 * Verifies if the actual page has an authorization code
 *
 * @returns true if the page contains an authorization code, false otherwise
 */
export const hasCallbackCode = function () {
  const code = getUrlAuthorizationCode();
  return code !== null;
};

/**
 * Exchange the authorization code in the url to an access token
 * The authorization code will be removed from the url
 * @returns the access token
 * @throws {AbortError} when the authentication flow has been canceled (using signal)
 * @throws {NetworkError} when a connection error occured
 * @throws {MissingCodeParameterError} when the code parameter is missing
 * @throws {InvalidCodeParameterError} when the code parameter is malformed or has expired
 * @throws {UnexpectedError} when an unexpected error occured
 */
export const handleCallbackCode = async (signal?: AbortSignal) => {
  try {
    const code = getUrlAuthorizationCode();
    const codeVerifier = getSessionCodeVerifier();

    if (code === null) {
      throw new MissingCodeParameterError();
    }

    removeSessionCodeVerifier();
    removeUrlAuthorizationCode();

    const { access_token } = (await endpoint({
      method: "POST",
      ressource: "/email/tokens",
      data: {
        code: code,
        code_verifier: codeVerifier,
      },
      signal,
    })) as { access_token: string };

    return access_token;
  } catch (e: any) {
    if (
      e instanceof AbortError ||
      e instanceof NetworkError ||
      e instanceof MissingCodeParameterError
    ) {
      throw e;
    }

    if (e instanceof UnauthorizedError) {
      throw new InvalidCodeParameterError();
    }

    throw new UnexpectedError(e);
  }
};

const getUrlAuthorizationCode = function () {
  return new URLSearchParams(window.location.search).get("code");
};

const removeUrlAuthorizationCode = function () {
  var url = new URL(window.location.toString());
  url.searchParams.delete("code");
  window.history.pushState(null, "", `${url.pathname}${url.search === "?" ? "" : url.search}`);
};

const SESSION_ITEM_CODE_VERIFIER = "nopwd:codeverifier";

const getSessionCodeVerifier = function () {
  return sessionStorage.getItem(SESSION_ITEM_CODE_VERIFIER);
};

const generateSessionCodeVerifier = function () {
  const random = generateRandomString(24);
  sessionStorage.setItem(SESSION_ITEM_CODE_VERIFIER, random);
};

const removeSessionCodeVerifier = function () {
  sessionStorage.removeItem(SESSION_ITEM_CODE_VERIFIER);
};
