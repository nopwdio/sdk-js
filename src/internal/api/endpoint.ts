import {
  AbortError,
  ApiError,
  BadRequestError,
  ForbiddenError,
  InternalError,
  NetworkError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "./errors.js";

const API_BASE = "https://api.nopwd.io/v0";

export interface Params {
  method: string; // GET, POST, PUT, DELETE
  ressource: string; // must start with a "/"
  data?: object; // a json body if provided
  signal?: AbortSignal;
}

export const endpoint = async function (params: Params) {
  try {
    const resp = await fetch(`${API_BASE}${params.ressource}`, {
      method: params.method,
      body: params.data ? JSON.stringify(params.data) : undefined,
      signal: params.signal,
    });

    if (!resp.ok) {
      throw new ApiError(resp.status, await resp.json());
    }

    return resp.json();
  } catch (e: any) {
    if (e.name === "AbortError") {
      throw new AbortError();
    }

    if (e instanceof ApiError) {
      switch (e.getStatus()) {
        case 400:
          throw new BadRequestError(e.getData());
        case 401:
          throw new UnauthorizedError(e.getData());
        case 403:
          throw new ForbiddenError(e.getData());
        case 404:
          throw new NotFoundError(e.getData());
        case 429:
          throw new TooManyRequestsError(e.getData());
      }

      throw new InternalError(e.getData());
    }

    // should be a network error
    throw new NetworkError();
  }
};
