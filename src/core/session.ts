import { endpoint } from "../internal/api/endpoint";
import { ApiError, NetworkError, TooManyRequestsError } from "../internal/api/errors";
import { generateKey, sign } from "../internal/crypto/ecdsa";
import { bufferTo64Safe, decodeFromSafe64 } from "../internal/crypto/encoding";
import { Mutex } from "../internal/util/mutex";
import { deleteItem, getItem, open, putItem } from "../internal/util/store";
import { TokenPayload, getPayload } from "./token";
import { isWebauthnSupported } from "./webauthn";

interface SessionObject {
  id: string;
  session_id: string;

  next_challenge: string;
  private_key: CryptoKeyPair["privateKey"];

  created_at: number;
  expires_at: number;
  idle_lifetime: number;

  token: string;
  refreshed_at: number;
}

export interface Session {
  created_at: number; // when the session has been created
  expires_at: number; // the session expiration date
  idle_lifetime: number; // the session idle lifetime

  token: string; // the last generated token
  refreshed_at: number; // when a new token has been generated
  token_payload: TokenPayload; // its payload

  suggest_passkeys: boolean; // true if the user doesn't use a passkey and the browser support it
}

const getDb = async function () {
  return open("nopwd", [{ name: "sessions", id: "id", auto: false }]);
};

export const create = async function (token: string, lifetime?: number, idleLifetime?: number) {
  const now = Math.round(Date.now() / 1000);
  const keyPair = await generateKey();
  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

  lifetime = lifetime ? lifetime : 24 * 60 * 60;
  idleLifetime = idleLifetime ? idleLifetime : lifetime;

  const { session_id, next_challenge, idle_lifetime, expires_at } = await endpoint({
    method: "POST",
    ressource: "/sessions",
    data: {
      public_key: publicKey,
      idle_lifetime: idleLifetime,
      lifetime: lifetime,
      access_token: token,
    },
  });

  const db = await getDb();

  const sessionObject: SessionObject = {
    id: "current",
    token: token,
    session_id,
    next_challenge,
    private_key: keyPair.privateKey,
    refreshed_at: now,
    created_at: now,
    expires_at: expires_at,
    idle_lifetime: idle_lifetime,
  };

  await putItem<SessionObject>(db, "sessions", sessionObject);
  return sessionObjectToSession(sessionObject);
};

const mutex = new Mutex();

export const get = async function (): Promise<Session | null> {
  const unlock = await mutex.lock();

  try {
    const now = Math.round(Date.now() / 1000);
    const db = await getDb();
    const currentSession = await getItem<SessionObject>(db, "sessions", "current");

    if (!currentSession) {
      return null;
    }

    const jwt = getPayload(currentSession.token);

    if (now <= jwt.exp - 60) {
      return sessionObjectToSession(currentSession);
    }

    const challenge = decodeFromSafe64(currentSession.next_challenge);
    const signature = await sign(challenge, currentSession.private_key);

    const { access_token, next_challenge } = await endpoint({
      method: "POST",
      ressource: `/sessions/${currentSession.session_id}/tokens`,
      data: {
        signature: bufferTo64Safe(signature),
      },
    });

    currentSession.token = access_token;
    currentSession.next_challenge = next_challenge;
    currentSession.refreshed_at = now;

    await putItem(db, "sessions", currentSession);
    return sessionObjectToSession(currentSession);
  } catch (e) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError) {
      throw e;
    }

    const db = await getDb();
    await deleteItem(db, "sessions", "current");
    return null;
  } finally {
    unlock();
  }
};

export const revoke = async function () {
  const db = await getDb();
  const currentSession = await getItem<SessionObject>(db, "sessions", "current");

  if (!currentSession) {
    return;
  }

  try {
    await endpoint({
      method: "DELETE",
      ressource: `/sessions/${currentSession.session_id}`,
    });
  } catch (e) {
    if (e instanceof NetworkError || e instanceof TooManyRequestsError) {
      throw e;
    }

    console.log(e);
  }

  return deleteItem(db, "sessions", "current");
};

const sessionObjectToSession = async function (sessionObject: SessionObject): Promise<Session> {
  const jwt = getPayload(sessionObject.token);
  const webauthnSupported = await isWebauthnSupported();

  return {
    created_at: sessionObject.created_at,
    expires_at: sessionObject.expires_at,
    refreshed_at: sessionObject.refreshed_at,
    idle_lifetime: sessionObject.idle_lifetime,

    token: sessionObject.token,
    token_payload: jwt,

    suggest_passkeys: webauthnSupported && !jwt.amr.includes("webauthn"),
  };
};
