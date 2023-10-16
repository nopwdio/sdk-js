interface HandlerResponse {
  status: number;
  json?: any;
}

type Handler = () => Promise<HandlerResponse>;

export class MockFetch {
  baseUrl: string;
  ressourcesHandler: Map<string, Handler>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.ressourcesHandler = new Map<string, Handler>();
  }

  on(method: string, ressource: string) {
    return {
      returns: (handler: Handler) => {
        this.ressourcesHandler.set(`${method.toUpperCase()}-${this.baseUrl}${ressource}`, handler);
        return this;
      },
    };
  }

  mock() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input !== "string") {
        console.warn("fetch mock supports only url input");
        return {} as Response;
      }

      const url = input.split("?")[0];

      const handler = this.ressourcesHandler.get(`${init?.method || "GET"}-${url}`);

      if (!handler) {
        console.warn(`no handler found for ${init?.method} ${input}`);
        return {} as Response;
      }

      const resp = await handler();

      return {
        json: () => Promise.resolve(resp.json),
        status: resp.status,
        ok: resp.status === 200,
      } as Response;
    };
  }
}

export class MockFetch2 {
  baseUrl: string;
  ressourcesHandler: Map<string, Handler>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.ressourcesHandler = new Map<string, Handler>();
  }

  mock(method: string, ressource: string) {
    return {
      returns: (handler: Handler) => {
        this.ressourcesHandler.set(`${method.toUpperCase()}-${this.baseUrl}${ressource}`, handler);
        return this;
      },
    };
  }
}
