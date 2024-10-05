import { endpoint } from "../internal/api/endpoint.js";
import {
  AbortError,
  NetworkError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../internal/api/errors.js";
import { generateKey, sign } from "../internal/crypto/ecdsa.js";
import { bufferTo64Safe, decodeFromSafe64 } from "../internal/crypto/encoding.js";

import { deleteItem, getItem, open, putItem } from "../internal/util/store.js";
import { UnexpectedError } from "./errors.js";
import { TokenPayload, getPayload } from "./token.js";
import { isWebauthnSupported } from "./webauthn.js";

// global variables
let session: Session | null | undefined = undefined;
let sessionStateListeners: SessionStateListener[] = [];
let signalWhenSessionExpiredTimeoutId: number | undefined = undefined;

// Internal indexeddb session object
interface SessionObject {
  id: string;
  session_id: string;

  next_challenge: string;
  private_key: CryptoKeyPair["privateKey"];

  created_at: number;
  created_with: string[];
  expires_at: number;
  used_at: number;
  idle_timeout: number;
}

// TODO: make SessionObject inherites from Session with challenge and key
export interface Session {
  created_at: number; // when the session has been created
  created_with: string[];
  expires_at: number; // the session expiration date
  used_at: number; // when a new token has been generated
  idle_timeout: number; // the session idle lifetime

  token: string;
  token_payload: TokenPayload;

  suggest_passkeys: boolean; // true if the user doesn't use a passkey and the browser supports it
}

/**
 * Create a session and replace the current one if exists.
 * @param token the access token generated by email or passkey authentication methods.
 * @param lifetime the session maximum duration in second. By default 24h.
 * @param idleTimeout the session inactivity timeout.
 * @returns the session object.
 * @throws {AbortError} when the authentication flow has been canceled (using signal)
 * @throws {UnexpectedError} when an unexpected error occured
 * @throws {MissingTokenError} if the token is not defined
 * @throws {NetworkError} when a connection error occured
 * @throws {InvalidTokenError} when the access token is malformed or expired
 */
export const create = async function (
  token: string,
  lifetime?: number,
  idleTimeout?: number
): Promise<Session> {
  try {
    const now = Math.round(Date.now() / 1000);
    const keyPair = await generateKey();
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    lifetime = lifetime ? lifetime : 24 * 60 * 60;
    idleTimeout = idleTimeout ? idleTimeout : lifetime;

    const {
      session_id,
      next_challenge,
      idle_timeout,
      expires_at,
      created_at,
      created_with,
      used_at,
    } = await endpoint({
      method: "POST",
      ressource: "/sessions",
      data: {
        public_key: publicKey,
        idle_timeout: idleTimeout,
        lifetime: lifetime,
        access_token: token,
      },
    });

    const db = await getNopwdDb();

    const sessionObject: SessionObject = {
      id: "current",
      session_id,
      next_challenge,
      private_key: keyPair.privateKey,
      used_at: now,
      created_at: now,
      created_with: created_with,
      expires_at: expires_at,
      idle_timeout: idle_timeout,
    };

    await putItem<SessionObject>(db, "sessions", sessionObject);

    session = {
      token: token,
      token_payload: getPayload(token),

      created_at: created_at,
      created_with: created_with,

      expires_at: expires_at,
      idle_timeout: idle_timeout,
      used_at: used_at,

      suggest_passkeys: (await isWebauthnSupported()) && !created_with.includes("webauthn"),
    };

    signalSessionChanged(session);
    return session;
  } catch (e: any) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError || e instanceof AbortError) {
      throw e;
    }

    throw new UnexpectedError(e);
  }
};

export const get = async function (): Promise<Session | null> {
  try {
    await initialized;
    const now = Math.round(Date.now() / 1000);

    if (session && session.token_payload.exp - 60 > now) {
      signalSessionChanged(session);
      return session;
    }

    const db = await getNopwdDb();
    const storedSession = await getItem<SessionObject>(db, "sessions", "current");

    if (!storedSession) {
      signalSessionChanged(null);
      return null;
    }

    if (
      storedSession.expires_at < now ||
      storedSession.used_at + storedSession.idle_timeout < now
    ) {
      const db = await getNopwdDb();
      await deleteItem(db, "sessions", "current");
      signalSessionChanged(null);
      return null;
    }

    const challenge = decodeFromSafe64(storedSession.next_challenge);
    const signature = await sign(challenge, storedSession.private_key);

    const { access_token, next_challenge } = await endpoint({
      method: "POST",
      ressource: `/sessions/${storedSession.session_id}/tokens`,
      data: {
        signature: bufferTo64Safe(signature),
      },
    });

    const payload = getPayload(access_token);

    storedSession.next_challenge = next_challenge;
    storedSession.used_at = payload.iat;
    await putItem(db, "sessions", storedSession);

    session = {
      token: access_token,
      token_payload: payload,

      created_at: storedSession.created_at,
      created_with: storedSession.created_with,

      expires_at: storedSession.expires_at,
      idle_timeout: storedSession.idle_timeout,
      used_at: storedSession.used_at,

      suggest_passkeys:
        (await isWebauthnSupported()) && !storedSession.created_with.includes("webauthn"),
    };

    signalSessionChanged(session);
    return session;
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof NotFoundError) {
      const db = await getNopwdDb();
      await deleteItem(db, "sessions", "current");
      signalSessionChanged(null);
      return null;
    }

    throw e;
  }
};

export const revoke = async function () {
  const db = await getNopwdDb();

  try {
    const currentSession = await getItem<SessionObject>(db, "sessions", "current");

    if (!currentSession) {
      return;
    }

    await endpoint({
      method: "DELETE",
      ressource: `/sessions/${currentSession.session_id}`,
    });
  } catch (e: any) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError) {
      throw e;
    }

    throw new UnexpectedError(e);
  } finally {
    await deleteItem(db, "sessions", "current");
    session = null;
    signalSessionChanged(null);
    //localStorage.removeItem("nopwd:session:activity");
  }
};

export type SessionStateListener = (session: Session | null | undefined) => void;

export const addSessionStateChanged = function (listener: SessionStateListener) {
  listener(session);
  sessionStateListeners.push(listener);
};

export const removeSessionStateChanged = function (listener: SessionStateListener) {
  sessionStateListeners.some((value, index) => {
    if (listener === value) {
      sessionStateListeners.splice(index, 1);
      return true;
    }

    return false;
  });
};

const signalSessionChanged = function (session: Session | null) {
  clearTimeout(signalWhenSessionExpiredTimeoutId);

  if (session) {
    signalWhenSessionExpiredTimeoutId = window.setTimeout(() => {
      signalSessionChanged(null);
    }, session.idle_timeout * 1000);
  }

  sessionStateListeners.forEach((listener) => {
    listener(session);
  });
};

const getNopwdDb = async function () {
  return open("nopwd", [{ name: "sessions", id: "id", auto: false }]);
};

const initialized = get();
