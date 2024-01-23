import { endpoint } from "../internal/api/endpoint.js";
import { AbortError, NetworkError, TooManyRequestsError } from "../internal/api/errors.js";
import { generateKey, sign } from "../internal/crypto/ecdsa.js";
import { bufferTo64Safe, decodeFromSafe64 } from "../internal/crypto/encoding.js";

import { deleteItem, getItem, open, putItem } from "../internal/util/store.js";
import { UnexpectedError } from "./errors.js";
import { TokenPayload, getPayload } from "./token.js";
import { isWebauthnSupported } from "./webauthn.js";

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

export interface Session {
  created_at: number; // when the session has been created
  created_with: string[];
  expires_at: number; // the session expiration date
  used_at: number; // when a new token has been generated
  idle_timeout: number; // the session idle lifetime

  token: string;
  token_payload: TokenPayload;

  suggest_passkeys: boolean; // true if the user doesn't use a passkey and the browser support it
}

const getNopwdDb = async function () {
  return open("nopwd", [{ name: "sessions", id: "id", auto: false }]);
};

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

    const session = {
      token: token,
      token_payload: getPayload(token),

      created_at: created_at,
      created_with: created_with,

      expires_at: expires_at,
      idle_timeout: idle_timeout,
      used_at: used_at,

      suggest_passkeys: (await isWebauthnSupported()) && !created_with.includes("webauthn"),
    };

    pSession = Promise.resolve(session);

    return session;
  } catch (e: any) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError || e instanceof AbortError) {
      throw e;
    }

    throw new UnexpectedError(e);
  }
};

export const get = async function (): Promise<Session | null> {
  const now = Math.round(Date.now() / 1000);

  if (pSession === null) {
    pSession = refreshSession();
    return pSession;
  }

  const session = await pSession;

  if (session === null) {
    return null;
  }

  if (session.token_payload.exp - 60 <= now) {
    pSession = refreshSession();
    return pSession;
  }

  if (session.token_payload.exp - 5 * 60 <= now) {
    const prev = pSession;
    pSession = refreshSession();
    return prev;
  }

  return pSession;
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
    pSession = Promise.resolve(null);
    //localStorage.removeItem("nopwd:session:activity");
  }
};

const refreshSession = async function (): Promise<Session | null> {
  try {
    const now = Math.round(Date.now() / 1000);
    const db = await getNopwdDb();
    const session = await getItem<SessionObject>(db, "sessions", "current");

    if (!session) {
      return null;
    }

    if (session.expires_at < now || session.used_at + session.idle_timeout < now) {
      throw new Error("expired session"); // go to catch
    }

    const challenge = decodeFromSafe64(session.next_challenge);
    const signature = await sign(challenge, session.private_key);

    const { access_token, next_challenge } = await endpoint({
      method: "POST",
      ressource: `/sessions/${session.session_id}/tokens`,
      data: {
        signature: bufferTo64Safe(signature),
      },
    });

    const payload = getPayload(access_token);

    session.next_challenge = next_challenge;
    session.used_at = payload.iat;
    await putItem(db, "sessions", session);

    return {
      token: access_token,
      token_payload: payload,

      created_at: session.created_at,
      created_with: session.created_with,

      expires_at: session.expires_at,
      idle_timeout: session.idle_timeout,
      used_at: session.used_at,

      suggest_passkeys: (await isWebauthnSupported()) && !session.created_with.includes("webauthn"),
    };
  } catch (e) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError || e instanceof AbortError) {
      throw e;
    }

    const db = await getNopwdDb();
    await deleteItem(db, "sessions", "current");

    return null;
  }
};

let pSession: null | Promise<Session | null> = null;
