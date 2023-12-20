import { endpoint } from "../internal/api/endpoint.js";
import {
  AbortError,
  NetworkError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../internal/api/errors.js";
import { bufferTo64Safe, decodeFromSafe64 } from "../internal/crypto/encoding.js";
import { sha256 } from "../internal/crypto/hash.js";
import {
  InvalidSignatureError,
  InvalidTokenError,
  QuotaError,
  UnexpectedError,
  UnknownChallengeOrPasskeyError,
  WebauthnNotSupportedError,
} from "./errors.js";
import { getPayload } from "./token.js";

export interface Passkey {
  id: string;
  alg: string;
}

/**
 * Register a new Passkey
 * @param token An access token to prove the user has been already authenticated
 */
export const register = async function (token: string, signal?: AbortSignal) {
  try {
    if (!isWebauthnSupported()) {
      throw new WebauthnNotSupportedError();
    }

    const payload = getPayload(token);

    if (payload.exp < Date.now() / 1000) {
      throw new InvalidTokenError();
    }

    interface CredentialResponse extends Credential {
      response: {
        clientDataJSON: ArrayBuffer;
        attestationObject: ArrayBuffer;
      };
    }

    // to avoid storing personal identifier in plain text
    const userId = await sha256(payload.sub);

    const cred = (await navigator.credentials.create({
      signal,
      publicKey: {
        challenge: decodeFromSafe64(payload.jti),
        rp: {
          name: payload.aud,
        },
        user: {
          id: userId,
          name: payload.sub,
          displayName: payload.sub,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          userVerification: "required",
        },
      },
    })) as CredentialResponse | null;

    if (cred === null) {
      throw new AbortError();
    }

    const { alg } = (await endpoint({
      method: "POST",
      ressource: "/webauthn/passkeys",
      data: {
        client_data: bufferTo64Safe(cred.response.clientDataJSON),
        attestation_object: bufferTo64Safe(cred.response.attestationObject),
        access_token: token,
      },
      signal,
    })) as { alg: string };

    return {
      id: cred.id,
      alg: alg,
    };
  } catch (e: any) {
    if (
      e instanceof AbortError ||
      e instanceof NetworkError ||
      e instanceof InvalidTokenError ||
      e instanceof WebauthnNotSupportedError
    ) {
      throw e;
    }

    throw new UnexpectedError(e);
  }
};

export const startConditional = async (signal?: AbortSignal) => {
  const { challenge } = await getChallenge(signal);
  const authResponse = await signChallenge(challenge, signal);
  return await verifySignature(authResponse, signal);
};

export const getChallenge = async (signal?: AbortSignal) => {
  try {
    const { challenge, expires_at } = (await endpoint({
      method: "GET",
      ressource: "/webauthn/challenge",
      signal,
    })) as {
      challenge: string;
      expires_at: number;
    };

    return {
      challenge,
      expiresAt: expires_at,
    };
  } catch (e: any) {
    if (e instanceof AbortError || e instanceof NetworkError) {
      throw e;
    }

    if (e instanceof TooManyRequestsError) {
      throw new QuotaError(e.getRetryAt());
    }

    throw new UnexpectedError(e);
  }
};

export const signChallenge = async function (challenge: string, signal?: AbortSignal) {
  try {
    if (!(await isWebauthnSupported())) {
      throw new WebauthnNotSupportedError();
    }

    var options: CredentialRequestOptions = {
      signal,
      publicKey: {
        userVerification: "required",
        challenge: decodeFromSafe64(challenge),
      },
      mediation: "conditional" as CredentialMediationRequirement,
    };

    interface CredentialResponse extends Credential {
      id: string;
      response: {
        signature: ArrayBuffer;
        authenticatorData: ArrayBuffer;
        clientDataJSON: ArrayBuffer;
      };
    }

    const result = (await navigator.credentials.get(options)) as CredentialResponse | null;

    if (result === null) {
      throw new AbortError();
    }

    return {
      id: result.id,
      signature: bufferTo64Safe(result.response.signature),
      authenticatorData: bufferTo64Safe(result.response.authenticatorData),
      clientData: bufferTo64Safe(result.response.clientDataJSON),
    };
  } catch (e: any) {
    if (e instanceof AbortError || e instanceof WebauthnNotSupportedError) {
      throw e;
    }

    throw new UnexpectedError(e);
  }
};

export const verifySignature = async (
  params: {
    id: string;
    signature: string;
    authenticatorData: string;
    clientData: string;
  },
  signal?: AbortSignal
) => {
  try {
    const { access_token } = (await endpoint({
      method: "POST",
      ressource: "/webauthn/tokens",
      data: {
        id: params.id,
        signature: params.signature,
        authenticator_data: params.authenticatorData,
        client_data: params.clientData,
      },
      signal,
    })) as { access_token: string };

    return access_token;
  } catch (e: any) {
    if (e instanceof AbortError || e instanceof NetworkError) {
      throw e;
    }

    if (e instanceof NotFoundError) {
      throw new UnknownChallengeOrPasskeyError();
    }

    if (e instanceof UnauthorizedError) {
      throw new InvalidSignatureError();
    }

    throw new UnexpectedError(e);
  }
};

export const isWebauthnSupported = async () => {
  return (
    window.PublicKeyCredential !== undefined &&
    window.PublicKeyCredential.isConditionalMediationAvailable?.()
  );
};
